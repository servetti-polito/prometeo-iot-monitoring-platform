const db = require("./dao");

const insertUserData = async (userID, answers) => {
  const now = new Date()
  try {
    await db("PERSONAL")
      .insert({
        userID: userID,
        timestamp: now,
        answers: answers,
      })
      .onConflict("userID")
      .merge();

    return answers;
  } catch (error) {
    throw error;
  }
};

const getUserData = async (userID) => {
  try {
    const userData = await db("PERSONAL").select("*").where("userID", userID).first();
    return userData;
  } catch (error) {
    throw error;
  }
};

const getAllSurveys = async () => {

  try {
    let personalSurveys = await db("PERSONAL").select("*")
    return personalSurveys;
  } catch (error) {
    throw error;
  }
};

const personal = { insertUserData, getUserData, getAllSurveys};
module.exports = personal;
