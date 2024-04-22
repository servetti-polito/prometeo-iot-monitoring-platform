const surveyDao = require("../dao/surveyDao");
const XLSX = require("xlsx");

const newSurvey = async (resultID, boardID, userID, answers, mqttMessage) => {
  const formattedTimestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  let ans = JSON.parse(answers);
  delete ans.resultID;
  delete ans.boardID;
  delete ans.userID;
  delete ans.mqttMessage;

  try {
    return await surveyDao.newSurvey(
      resultID,
      formattedTimestamp,
      boardID,
      userID,
      JSON.stringify(ans),
      mqttMessage
    );
  } catch (err) {
    console.error("Error: service newSurvey" + err.message);
    throw { status: err.status, message: err.message };
  }
};

const getUserSurveys = async (userID) => {
  try {
    return await surveyDao.getUserSurveys(userID);
  } catch (err) {
    console.error("Error: service getUserSurveys - " + err.message);
    throw { status: err.status, message: err.message };
  }
};

const createWorkBook = (data, fileName) => {
  const wb = XLSX.utils.book_new();
  let bIDs = new Set(data.map((b) => b.boardID));
  bIDs = Array.from(bIDs).sort();
  for (const bID of bIDs) {
    let bData = data.filter((b) => b.boardID == bID);
    let keys = new Set([]);
    bData.forEach((b) =>
      Object.keys(b).forEach((ok) => keys.add(ok.toString()))
    );
    keys = [...keys].filter(k => k.match(/^[Qp]/)).sort()
    
    keys.unshift("userID")
    keys.unshift("resultID")
    keys.unshift("timestamp")
    keys.unshift("boardID")
    const ws = XLSX.utils.json_to_sheet(bData, {
      header: keys,
    });
    XLSX.utils.book_append_sheet(wb, ws, bID.toString());
  }
  XLSX.writeFile(wb, `./${fileName}.xlsx`, { compression: true });
};

const getAllSurveys = async (from, to, boardID, fileName) => {
  try {
    let ret = await surveyDao.getAllSurveys(from, to, boardID);
    //flatten the ret array
    ret.forEach((r) => {
      r.answers = JSON.parse(r.answers);
      delete r.answers.timestamp;

      for (let key in r.answers) {
        if (r.answers.hasOwnProperty(key)) {
          r[key] = r.answers[key]? r.answers[key].toString() : "";
          delete r.answers[key];
        }
      }

      r.personal_answers = JSON.parse(r.personal_answers);
      for (let key in r.personal_answers) {
        if (r.personal_answers.hasOwnProperty(key)) {
          r[key] = r.personal_answers[key]? r.personal_answers[key].toString() : null;
          delete r.personal_answers[key];
        }
      }

      delete r.answers;
      delete r.personal_answers;
    });
    //excel file creation
    createWorkBook(ret, fileName);
    return ret;
  } catch (err) {
    console.error("Error: service getSurveys - " + err.message);
    throw { status: err.status, message: err.message };
  }
};

const getBoardIDSurveys = async (boardID) => {
  try {
    return await surveyDao.getBoardIDSurveys(boardID);
  } catch (err) {
    console.error("Error: service getBoardIDSurveys - " + err.message);
    throw { status: err.status, message: err.message };
  }
};

const getLatestBoardID = async (userId) => {
  try {
    return await surveyDao.getLatestBoardID(userId);
  } catch (err) {
    console.error("Error: service getLatestBoardID - " + err.message);
    throw { status: err.status, message: err.message };
  }
};

const surveys = {
  newSurvey,
  getAllSurveys,
  getUserSurveys,
  getBoardIDSurveys,
  getLatestBoardID,
};
module.exports = surveys;
