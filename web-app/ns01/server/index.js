"use strict";

import express from "express";
import { Issuer, Strategy } from "openid-client";
import passport from "passport";
import expressSession from "express-session";
import cookieParser from "cookie-parser";

import { scryptSync, timingSafeEqual } from "crypto";

const app = express();
const port = 3001;
const basePath = `https://${process.env.domain}`;
const redirectUri = [`${basePath}${process.env.redirectPath}`];
const logoutUri = [`${basePath}${process.env.logoutPath}`];
const realmName = process.env.realmName;

const clientId = process.env.keycloackClientId;
const clientSecret = process.env.keycloackSecretId;
const adminUser = process.env.adminUser;
const adminPassword = process.env.adminPassword;
const studentSalt = process.env.studentSalt;
const privateSalt = process.env.privateSalt;
const keylen = 9;

app.use(express.json());
app.enable("trust proxy");
app.set("trust proxy", true);

app.use(
  expressSession({
    secret: "my_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.authenticate("session"));
app.use(cookieParser());

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var keycloakIssuer = null;
while (keycloakIssuer == null) {
  try {
    keycloakIssuer = await Issuer.discover(
      `http://keycloack:8080/realms/${realmName}`
    );
  } catch (error) {
    console.log("Waiting for Keycloak...");
    await sleep(10 * 1000);
  }
}

const client = new keycloakIssuer.Client({
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uris: [redirectUri],
  post_logout_redirect_uris: [logoutUri],
});

passport.use(
  "oidc",
  new Strategy({ client }, async function (tokenSet, _, done) {
    console.log("Checked Authentication....");
    const informationsUser = await client.introspect(tokenSet.access_token);

    let providedData = {
      user_name: informationsUser.username,
      role: informationsUser.realm_access.roles[0],
      token: tokenSet.access_token,
      refresh_token: tokenSet.refresh_token,
      id_token: tokenSet.id_token,
      authenticated: true,
    };
    done(null, providedData);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

const savePageSession = (req, res, next) => {
  const clientPath = `${basePath}${req.query.redirect}`;
  res.cookie("path", clientPath);
  next();
};

/* The first route redirects the user to the Provider, where they will authenticate */
app.get("/auth/login", savePageSession, passport.authenticate("oidc"));

/* The second route processes the authentication response and logs the user in, 
when the OP redirects the user back to the app */
app.get(
  "/auth/login/callback",
  passport.authenticate("oidc"),
  async (req, res) => {
    const current_user_info = {
      token: req.user.token,
      refresh_token: req.user.refresh_token,
      id_token: req.user.id_token,
      authenticated: true,
    };
    const path = cookieParser.JSONCookies(req.cookies).path;
    res
      .cookie("user_info", current_user_info)
      .cookie("User", req.user.user_name)
      .cookie("Role", req.user.role)
      .clearCookie("path")
      .redirect(path);
  }
);

// start logout request
app.post("/auth/logout", (req, res) => {
  const jsonFormatCookie = cookieParser.JSONCookies(req.cookies);
  const logoutPath = jsonFormatCookie.user_info.authenticated
    ? client.endSessionUrl({
        post_logout_redirect_uri: logoutUri,
        id_token_hint: jsonFormatCookie.user_info.id_token,
      })
    : logoutUri;

  res
    .clearCookie("User")
    .clearCookie("Role")
    .clearCookie("user_info")
    .redirect(logoutPath);
});

app.get("/userInfo", async (req, res) => {
  const jsonFormatCookie = cookieParser.JSONCookies(req.cookies);
  if (jsonFormatCookie.user_info) {
    const response = await client.introspect(jsonFormatCookie.user_info.token);
    if (response.active) {
      res.status(200).json(response);
    } else {
      res.status(401).end();
    }
  } else {
    res.status(401).end();
  }
});

const isValidURLforViewerAndEditor = (queryParams) => {
  if (queryParams["panelId"]) {
    return false;
  }
  if (queryParams["uri"].startsWith("/chart/api/")) {
    return false;
  }
  if (queryParams["uri"].startsWith("/chart/public/")) {
    return false;
  }
  return true;
};

const checkRole = (req, res, next) => {
  const jsonFormatCookie = cookieParser.JSONCookies(req.cookies);
  if (
    isValidURLforViewerAndEditor(req.query) &&
    (jsonFormatCookie.Role == "Editor" ||
      jsonFormatCookie.Role == "Viewer" ||
      jsonFormatCookie.Role == "Private" ||
      jsonFormatCookie.Role == "Student")
  ) {
    res.status(403).end();
  } else {
    next();
  }
};

app.get("/auth/check", checkRole, async (req, res) => {
  const jsonFormatCookie = cookieParser.JSONCookies(req.cookies);
  try {
    const tokenInformations = await client.introspect(
      jsonFormatCookie.user_info.token
    );
    if (tokenInformations.active) {
      res.status(200).end();
    } else if (
      jsonFormatCookie.user_info.authenticated &&
      !tokenInformations.active
    ) {
      console.log("Refreshing...");
      const refreshing = await client.refresh(
        jsonFormatCookie.user_info.refresh_token
      );
      const new_user_info = {
        token: refreshing.access_token,
        refresh_token: refreshing.refresh_token,
        id_token: refreshing.id_token,
        authenticated: true,
      };
      res.cookie("user_info", new_user_info).status(200).end();
    } else {
      res.status(401).end();
    }
  } catch (e) {
    res.status(401).end();
  }
});

function base64url_decode(value) {
  const m = value.length % 4;
  return Uint8Array.from(
    atob(
      value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(value.length + (m === 0 ? 0 : 4 - m), "=")
    ),
    (c) => c.charCodeAt(0)
  ).buffer;
}

function compareKeys(storedKey, suppliedKey) {
  const compareWithSalt = (salt, role) => {
    try {
      const decodedStoredKey = base64url_decode(storedKey);
      const hashedSuppliedKey = scryptSync(suppliedKey, salt, keylen);

      if (timingSafeEqual(decodedStoredKey, hashedSuppliedKey)) {
        return role;
      }
    } catch (error) {
      console.error(`Error comparing keys for ${role}: ${error.message}`);
    }

    return false;
  };

  const studentResult = compareWithSalt(studentSalt, "Student");
  if (studentResult) {
    return studentResult;
  }

  const privateResult = compareWithSalt(privateSalt, "Private");
  if (privateResult) {
    return privateResult;
  }

  console.log("Error decoding");
  return false;
}

const ensurePermissions = async (req, res, next) => {
  // Pass the key throguh an header
  try {
    const passedKey = req.header("x-key");

    let [key, hashKey] = passedKey.split(".");
    let isValid = compareKeys(hashKey, key);
    console.log("isValid", isValid);

    if (isValid) {
      req.role = isValid;
      console.log("isValid", isValid);
      next();
    } else return res.status(401).send({ message: "Invalid key", code: 401 });
  } catch {
    return res.status(401).send({ message: "Invalid key", code: 401 });
  }
};

/**
 * /auth/key
 * Headers
 * X-path -> Indica il path di redirect
 * X-key -> Il segreto da usare che attualmente é solo 14fbfd546e444439b81cab18c28b3283
 * La funzione prende due parametri di query che corrispondono alla:
 * chiave privata (segreto) per tornare i cookie necessari; e un path per il redirect dell'utente.
 * Lo schema di user_info é lo stesso ma cambia il fatto che non viene fatto il refresh del token
 * Nel caso non venga previsto il path di redirect, l'api ritorna 401
 * diversamente viene rendirizzati verso la pagina indicata nel query param
 */

app.get("/auth/key", ensurePermissions, async (req, res) => {
  const url = `http://keycloack:8080/realms/${realmName}/protocol/openid-connect/token`;
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=password&client_id=${clientId}&client_secret=${clientSecret}&username=${adminUser}&password=${adminPassword}`,
  });

  const resultBody = await result.json();
  const user_info = {
    token: resultBody.access_token,
    refresh_token: resultBody.refresh_token,
    id_token: resultBody.access_token,
    authenticated: false,
  };
  const path = req.header("x-path");
  const keyHeader = req.header("x-key");

  let clientPath = `${basePath}${path}`;

  // If there is a request for graph in Grafana, the uri is reconstructed
  for (let key in req.query) {
    if (key == "path" || key == "key") continue;
    clientPath += "&" + key + "=" + req.query[key];
  }

  //
  if (!path) {
    res.status(401).end();
  } else {
    req.login(user_info, function (err) {
      if (err) {
        return next(err);
      }
      return res
        .cookie("User", "Anonymous")
        .cookie("Role", req.role)
        .cookie("user_info", user_info)
        .cookie("Key", keyHeader)
        .redirect(clientPath);
    });
  }
});

app.listen(port, function () {
  console.log("Listening at http://localhost:" + port);
});
