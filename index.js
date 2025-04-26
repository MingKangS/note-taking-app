require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./src/config/database");
const redisClient = require("./src/config/redis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Note-Taking API!");
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database successfully.");
    await sequelize.sync({ alter: true });
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully.");
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
