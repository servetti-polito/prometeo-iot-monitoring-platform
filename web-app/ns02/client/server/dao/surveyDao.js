// import mqtt from "mqtt/dist/mqtt";
const mqtt = require("mqtt");
const db = require("./dao");
// MQTT///////////////////////////////////////////
let client = mqtt.connect("wss://test.mosquitto.org:8081");
client.on("connect", function () {
  console.log("Mosquitto broker connected");
});
///////////////////////////////////////////////

const newSurvey = async (resultID, timestamp, boardID, userID, answers, mqttMessage) => {
  try {
    const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 16);
    await db("SURVEYS").insert({
      resultID: resultID,
      timestamp: formattedTimestamp,
      boardID: boardID,
      userID: userID,
      answers: answers,
    });

    let QoS = { qos: 1 };
    let topic = "prometeo/" + boardID + "/questionnaire";
    console.log(mqttMessage)
    client.publish(topic, JSON.stringify(mqttMessage), QoS);

    return {
      resultID: resultID,
      timestamp: formattedTimestamp,
      boardID: boardID,
      userID: userID,
      answers: answers,
      key: answers.key
    };
  } catch (error) {
    throw error;
  }
};

const getUserSurveys = async (userID) => {
  try {
    const userSurveys = await db("SURVEYS").select("*").where("userID", userID);
    return userSurveys;
  } catch (error) {
    throw error;
  }
};

const getAllSurveys = async (from, to, boardID) => {
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  const fromTimestamp = (from ? new Date(from) : oneMonthAgo)
    .toISOString()
    .slice(0, 16);
  const toTimestamp = (to ? new Date(to) : currentDate)
    .toISOString()
    .slice(0, 16);

  try {
    let userSurveys = db("SURVEYS")
      .select("SURVEYS.*", "PERSONAL.answers as personal_answers")
      .leftOuterJoin("PERSONAL", "SURVEYS.userID", "PERSONAL.userID")
      .where("SURVEYS.timestamp", "<=", toTimestamp)
      .where("SURVEYS.timestamp", ">=", fromTimestamp);

    if (boardID !== null && boardID !== undefined) userSurveys = userSurveys.where("SURVEYS.boardID", boardID);
    
    userSurveys = userSurveys.orderBy("SURVEYS.timestamp", "desc");

    const result = await userSurveys;
    return result;
  } catch (error) {
    throw error;
  }
};

const getBoardIDSurveys = async (boardID) => {
  try {
    const surveys = await db("SURVEYS")
      .select("answers")
      .where("boardID", boardID);
    return surveys.map((s) => ({ survey: s.answers }));
  } catch (error) {
    throw error;
  }
};

const getLatestBoardID = async (userId) => {
  try {
    const result = await db("SURVEYS")
      .max("timestamp as max_timestamp")
      .select("boardID", "userId")
      .where("userId", userId)
      .groupBy("boardID", "userId");

    if (result.length === 0) {
      return null; // Return null if no row is found for the given userId
    }

    return {
      boardID: result[0].boardID,
      maxTimestamp: result[0].max_timestamp,
    };
  } catch (error) {
    throw error;
  }
};

const surveys = {
  newSurvey,
  getBoardIDSurveys,
  getUserSurveys,
  getLatestBoardID,
  getAllSurveys,
};
module.exports = surveys;
