const { Sequelize } = require("sequelize");

// Create a Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST, // Database host
    port: process.env.DB_PORT, // Database port
    dialect: "mysql", // Database dialect
    logging: false, // Disable logging (optional)
  }
);

module.exports = sequelize;
