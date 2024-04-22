import API from "../API/API";
import measuresInfo from "../assets/measures.json";
import bToS from "../assets/boardIDtoSurvey.json";

const checkApiResult = (validResults, measure) => {
  let res = validResults.filter((v) => v["value"]["measure"] == measure);
  if (!res[0]) return null;
  res = res[0]["value"];
  if (!res) return null;
  res = res["value"];
  if (!res) return null;
  res = res["average"];
  if (!res) return null;
  else return res;
};

const sentenceFun = (message, ita) => {
  let result = "";
  console.log("message", message.toString())
  if (message["thermal_comfort_sbj"] !== null) {
    result += ita
      ? "Il tuo Comfort Termico è " + message["thermal_comfort_sbj"] + "%"
      : "Your Thermal Comfort is " + message["thermal_comfort_sbj"] + "%";
  }
  if (message["visual_comfort_sbj"] !== null) {
    if (result === "")
      result += ita
        ? "Il tuo Comfort Visivo è " + message["visual_comfort_sbj"] + "%"
        : "Your Visual Comfort is " + message["visual_comfort_sbj"] + "%";
    else
      result += ita
        ? ", il Comfort Visivo " + message["visual_comfort_sbj"] + "%"
        : ", Visual Comfort " + message["visual_comfort_sbj"] + "%";
  }
  if (message["acoustic_comfort_sbj"] !== null) {
    if (result === "")
      result += ita
        ? "Il tuo Comfort Acustico è " + message["acoustic_comfort_sbj"] + "%"
        : "Your Acoustic Comfort is " + message["acoustic_comfort_sbj"] + "%";
    else
      result += ita
        ? ", il Comfort Acustico " + message["acoustic_comfort_sbj"] + "%"
        : ", Acoustic Comfort " + message["acoustic_comfort_sbj"] + "%";
  }
  if (message["air_quality_sbj"] !== null) {
    if (result === "")
      result += ita
        ? "La tua Qualità dell'Aria è " + message["air_quality_sbj"] + "%"
        : "Your Indoor Air Quality is " + message["air_quality_sbj"] + "%";
    else
      result += ita
        ? ", la Qualità dell'Aria " + message["air_quality_sbj"] + "%"
        : ", Indoor Air Quality " + message["air_quality_sbj"] + "%";
  }
  return result;

};

async function evaluateComfort(answers) {
  let result = {
    thermal_comfort_sbj: null,
    visual_comfort_sbj: null,
    acoustic_comfort_sbj: null,
    air_quality_sbj: null,
    env_quality_sbj: null,
    thermal_comfort_obj: null,
    visual_comfort_obj: null,
    air_quality_obj: null,
    acoustic_comfort_obj: null,
    env_quality_obj: null,
    timestamp: 0,
  };

  const apiPromises = [];

  ["Temp", "Light", "Air", "Sound", "IEQ"].forEach((measure) => {
    const promise = API.getDashboardValues(
      measure,
      measuresInfo[measure].grafana.unitName,
      "3h",
      "3h",
      localStorage.getItem("boardID")
    );

    apiPromises.push(promise);
  });

  await Promise.allSettled(apiPromises).then((apiResults) => {
    const validResults = apiResults.filter((p) => p.status !== "rejected");
    const surveyID = bToS.find((item) => item.boardID == localStorage.getItem("boardID"))?.surveyID || null;
    if (!surveyID) {
      console.error("surveyID not found - impossible calculate comfort")
      return result;
    }
    result["thermal_comfort_obj"] = checkApiResult(validResults, "Temp");
    result["visual_comfort_obj"] = checkApiResult(validResults, "Light");
    result["air_quality_obj"] = checkApiResult(validResults, "Air");
    result["acoustic_comfort_obj"] = checkApiResult(validResults, "Sound");
    result["env_quality_obj"] = checkApiResult(validResults, "IEQ");

    switch(surveyID) {
      case 1: result = survey1(answers, result); break;
      // case 2: result = survey2(answers, result); break;
      default : result = survey1(answers, result)
    }
  });

  return result;
}

const survey1 = (answers, result) => {
  if (answers["Q01"] === "4" || answers["Q01"] === "3") {
    result["thermal_comfort_sbj"] = 100;
    result["visual_comfort_sbj"] = 100;
    result["acoustic_comfort_sbj"] = 100;
    result["air_quality_sbj"] = 100;
    result["env_quality_sbj"] = 100;
    result["timestamp"] = 0;

    if (answers["Q02"].includes("THERMAL  COMFORT")) {
      let q3, q4, TC;
      // eslint-disable-next-line default-case
      switch (answers["Q03"]) {
        case "3":
          q3 = 25;
          break;
        case "2":
          q3 = 50;
          break;
        case "1":
          q3 = 75;
          break;
        case "0":
          q3 = 100;
          break;
        case "-1":
          q3 = 75;
          break;
        case "-2":
          q3 = 50;
          break;
        case "-3":
          q3 = 25;
          break;
      }
      // eslint-disable-next-line default-case
      switch (answers["Q04"]) {
        case "4":
          q4 = 25;
          break;
        case "3":
          q4 = 50;
          break;
        case "2":
          q4 = 75;
          break;
        case "1":
          q4 = 100;
          break;
      }
      TC = (q3 + q4) / 2;
      result["thermal_comfort_sbj"] = TC;
    }
    if (answers["Q02"].includes("ACOUSTIC  COMFORT")) {
      let q5, AC;
      // eslint-disable-next-line default-case
      switch (answers["Q05"]) {
        case "4":
          q5 = 25;
          break;
        case "3":
          q5 = 50;
          break;
        case "2":
          q5 = 75;
          break;
        case "1":
          q5 = 100;
          break;
      }
      AC = q5;
      result["acoustic_comfort_sbj"] = AC;
    }
    if (answers["Q02"].includes("VISUAL  COMFORT")) {
      let q7, VC;
      // eslint-disable-next-line default-case
      switch (answers["Q07"]) {
        case "4":
          q7 = 25;
          break;
        case "3":
          q7 = 50;
          break;
        case "2":
          q7 = 75;
          break;
        case "1":
          q7 = 100;
          break;
      }
      VC = q7;
      result["visual_comfort_sbj"] = VC;
    }
    if (answers["Q02"].includes("INDOOR AIR QUALITY")) {
      let q10, IAQ;
      // eslint-disable-next-line default-case
      switch (answers["Q10"]) {
        case "4":
          q10 = 25;
          break;
        case "3":
          q10 = 50;
          break;
        case "2":
          q10 = 75;
          break;
        case "1":
          q10 = 100;
          break;
      }
      IAQ = q10;
      result["air_quality_sbj"] = IAQ;
    }
    result["env_quality_sbj"] =
      (result["air_quality_sbj"] +
        result["visual_comfort_sbj"] +
        result["thermal_comfort_sbj"] +
        result["acoustic_comfort_sbj"]) /
      4;
  }
  if (answers["Q01"] === "2") {
    if (answers["Q02.5"].includes("THERMAL  COMFORT"))
      result["thermal_comfort_sbj"] = 75;
    if (answers["Q02.5"].includes("ACOUSTIC  COMFORT"))
      result["acoustic_comfort_sbj"] = 75;
    if (answers["Q02.5"].includes("VISUAL  COMFORT"))
      result["visual_comfort_sbj"] = 75;
    if (answers["Q02.5"].includes("INDOOR AIR QUALITY"))
      result["air_quality_sbj"] = 75;
    result["env_quality_sbj"] = 75;
  }
  if (answers["Q01"] === "1") {
    if (answers["Q02.5"].includes("THERMAL  COMFORT"))
      result["thermal_comfort_sbj"] = 100;
    if (answers["Q02.5"].includes("ACOUSTIC  COMFORT"))
      result["acoustic_comfort_sbj"] = 100;
    if (answers["Q02.5"].includes("VISUAL  COMFORT"))
      result["visual_comfort_sbj"] = 100;
    if (answers["Q02.5"].includes("INDOOR AIR QUALITY"))
      result["air_quality_sbj"] = 100;
    result["env_quality_sbj"] = 100;
  }
  result["timestamp"] = new Date().toISOString().replace(/Z/, "");
  return result
}

const comfort = { sentenceFun, evaluateComfort };
export default comfort;
