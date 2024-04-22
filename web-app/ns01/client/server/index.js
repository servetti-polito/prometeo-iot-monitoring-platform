const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const app = express(); // create express app
const passport = require("passport");
const surveys = require("./services/surveyService");
const personal = require("./services/personalService");
const cookieParser = require("cookie-parser");
const { format } = require("date-fns");
const fs = require("fs");

// start express server on port 5000
app.listen(5000, () => {
  console.log("server started on port 5000");
});

// add middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dist")));
// app.use(express.static("public"));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(function(req, res, next) {
  var err = null;
  try {
      decodeURIComponent(req.path)
  }
  catch(e) {
      err = e;
  }
  if (err){
      console.log(err, req.url);
      return res.redirect(['https://', req.get('Host'), '/404'].join(''));    
  }
  next();
});

function getRole(cookies) {
  return cookies.Role;
}
function getAuthentication(cookies) {
  return cookies.user_info.authenticated;
}
function getUser(cookies) {
  return cookies.User;
}
function getEmail(cookies) {
  const token = cookies.user_info.token;
  const [header, payload, signature] = token.split(".");
  const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
  const payloadObj = JSON.parse(decodedPayload);
  return payloadObj.email;
}

//Check of authentication for all privates routes
app.all("/api/prv/*", function (req, res, next) {
  try {
    console.log(
      "Auth:",  getAuthentication(req.cookies), 
      "Role:",  getRole(req.cookies),
      "User:",  getUser(req.cookies),
      "Email:", getEmail(req.cookies)
    );
    next();
  } catch {
    res.status(401).json("Unauthorized");
  }
});

//Submits a new survey
app.post("/api/prv/survey", async (req, res) => {
  try {
    const ret = await surveys.newSurvey(
      req.body.resultID,
      req.body.boardID,
      req.body.userID,
      req.body.answers,
      req.body.mqttMessage,
      req.body.key
    );
    res.status(201).json(ret);
  } catch (error) {
    console.error("Error: /api/survey - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

//Returns all the surveys submitted by the user
app.get("/api/prv/survey/user", async (req, res) => {
  try {
    const ret = await surveys.getUserSurveys(getEmail(req.cookies));
    res.status(200).json(ret);
  } catch (error) {
    console.error("Error: /api/survey/user - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});


// Returns the boardID associated with the last survey user submitted
app.get("/api/prv/survey/latest", async (req, res) => {
  try {
    const ret = await surveys.getLatestBoardID(getEmail(req.cookies));
    res.status(200).json(ret);
  } catch (error) {
    console.error("Error: /api/survey/boardID/latest - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

// Submits user personal information
app.post("/api/prv/personal", async (req, res) => {
  try {
    const ret = await personal.insertUserData(
      req.body.userID,
      req.body.answers
    );
    res.status(200).json(ret);
  } catch (error) {
    console.error("Error: /api/personal - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

// Returns user personal informations
app.get("/api/prv/personal", async (req, res) => {
  try {
    const ret = await personal.getUserData(getEmail(req.cookies));

    if (ret && ret.answers) {
      ret.answers = JSON.parse(ret.answers);
    }

    res.status(200).json(ret);
  } catch (error) {
    console.error("Error: /api/personal - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

// Api available for admin only - returns all surveys in a certain time range
app.get("/api/prv/survey/all", async (req, res) => {
  let now = new Date();
  let fileName = format(now, "yyyyMMdd_HHmmSSSS");
  try {
    let { from, to, boardID } = req.query;
    if (getRole(req.cookies) === "Admin" || getRole(req.cookies) === "Editor") {
    await surveys.getAllSurveys(from, to, boardID, fileName);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.download(`./${fileName}.xlsx`, (err) => {
      if (err) console.error(err);
      fs.unlink(`${fileName}.xlsx`, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        }
      });
    });
  

    } else {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }
  } catch (error) {
    console.error("Error: /api/surveys/all - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

app.get("/api/prv/personal/all", async (req, res) => {
  try {
    if (getRole(req.cookies) === "Admin") {
    let ret = await personal.getAllSurveys();
    res.status(200).send(ret);
    } else {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }
  } catch (error) {
    console.error("Error: /api/personal/all - " + error.message);
    res.status(error.status || 500).json(error.message);
  }
});

app.get("/userInfo", function (req, res) {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  fetch(`https://${host}/userInfo`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response; // Parse the response body as JSON
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
});

app.post("/auth/logout", function (req, res) {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  const logout = async () => {
    try {
      const response = await fetch(`https://${host}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

module.exports = app;
