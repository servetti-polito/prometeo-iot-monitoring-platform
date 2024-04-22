const knex = require("knex")(require("./db.config")["development"]);

async function checkConnection() {
  try {
    const result = await knex.raw("SELECT 1+1 AS result");
    console.log("Web server is running:", result[0][0].result === 2);
  } catch (error) {
    console.error("Error checking connection:", error);
  } 
}
checkConnection();

module.exports = knex


