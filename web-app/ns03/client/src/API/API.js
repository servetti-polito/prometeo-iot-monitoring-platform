import { ConditionsParser } from "survey-core";
import urls from "./urls.json"
// const urls = require("./urls.json");

const getUserInfo = async () => {
  try {
    const response = await fetch(urls.domain + "userInfo", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

const loginWithApiKey = async (key) => {
  try {
    const response = await fetch(urls.domain + "auth/key/" + key, {
      headers: {
        Accept: "application/json",
      },
    });
    if (response.ok) {
      await response.json();
      return response.ok;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const logout = async () => {
  try {
    await fetch(urls.domain + "auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};


const submitAnswers = async (answers) => {
  const url = urls.private + urls.survey;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        credentials: "include"
      },
      body: JSON.stringify(answers),
    });
    if (res.ok) {
      const ret = await res.json();
      return ret;
    } else {
      const errorResponse = await res.json();
      throw new Error(errorResponse.error || "Request failed");
    }
  } catch (err) {
    console.error("post Token failed: " + err);
    throw err;
  }
};


const submitData = async (data) => {
  const url = urls.private + urls.personal;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        credentials: "include"
      },
      body: JSON.stringify(data),
    });

   
    if (res.ok) {
      const ret = await res.json();
      return ret;
    } else {
      const errorRes = await res.json();
      console.error(errorRes);
      throw new Error(errorRes.error || "Request failed");
    }
  } catch (err) {
    console.error("post Token failed: " + err);
    throw err;
  }
};

const getSurveys = async (email) => {
  const url = urls.private + urls.personalSurveys;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        credentials: "include",
      }
    });
    if (res.ok) {
      const ret = await res.json();
      return ret;
    } else {
      const errorResponse = await res.json();
      throw new Error(errorResponse.error || "Request failed");
    }
  } catch (err) {
    console.error("get Token failed: " + err);
    throw err;
  }
  //ret = { status: 404, messageITA: "impossibile ottenere dati", messageENG: "impossible retrieving data" }
};

const getLatestBoardID = async () => {
  const url = urls.private + urls.latestBoardID;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        credentials: "include",
      },
    });
    if (res.ok) {
      const ret = await res.json();
      return ret;
    } else {
      const errorResponse = await res.json();
      throw new Error(errorResponse.error || "Request failed");
    }
  } catch (err) {
    console.error("get Token failed: " + err);
    throw err;
  }
  //ret = { status: 404, messageITA: "impossibile ottenere dati", messageENG: "impossible retrieving data" }
};

const getOldValues = async () => {
  const url = urls.private + urls.personal;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: new Headers({
        accept: "application/json, text/plain, */*",
        "Content-type": "application/json; charset=UTF-8",
        credentials: "include",
      }),
    });
    if (res.ok) {
      const ret = await res.json();
      return ret;
    } else {
      const errorResponse = await res.json();
      throw new Error(errorResponse.error || "Request failed");
    }
  } catch (err) {
    console.error("post Token failed: " + err);
    throw err;
  }
};

const getDashboardValues = (measure, query, avg, timeSpan, boardID) => {
  return new Promise((resolve, reject) => {
    fetch(urls.grafanaProxy + `${boardID}/unit/${query}?ts=${timeSpan}&avg=${avg}`, {
      method: "GET",
      headers: new Headers({
        accept: "application/json, text/plain, */*",
        "Content-type": "application/json; charset=UTF-8",
        credentials: "include",
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(errorResponse => Promise.reject(errorResponse.error || "Request failed"));
        }
      })
      .then(ret => {
        const dataPoints = ret["datapoints"];
        const value = dataPoints[0] ?? null;
        resolve({ measure, value });
      })
      .catch(err => {
        console.error("GET dashboard value failed: " + err);
        reject(err);
      });
  });
};



const api = {
  getUserInfo,
  loginWithApiKey,
  logout,

  submitData,
  submitAnswers,
  getSurveys,
  getOldValues,
  getLatestBoardID,

  getDashboardValues
};
export default api;
