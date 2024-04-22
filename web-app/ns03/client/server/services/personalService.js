const personalDao = require("../dao/personalDao");

const insertUserData = async (userID, answers) => {
  try {
    let ans = JSON.parse(answers)
    delete ans.userID
    delete ans.timestamp
    return await personalDao.insertUserData(userID, ans);
  } catch (err) {
    console.error("Error: service insertUserData - " + err.message);
    throw {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    };
  }
};

const getUserData = async (userID) => {
  try {
    return await personalDao.getUserData(userID);
  } catch (err) {
    console.error("Error: service getUserData - " + err.message);
    throw {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    };
  }
};

const getAllSurveys = async () => {
  try {
    return await personalDao.getAllSurveys();
  } catch (err) {
    console.error("Error: service getSurveys - " + err.message);
    throw { status: err.status, message: err.message };
  }
};


const personal = { insertUserData, getUserData, getAllSurveys };
module.exports = personal;
