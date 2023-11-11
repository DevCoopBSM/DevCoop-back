const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config();

module.exports = {
	host: "DevCoop_MySql",
	username: process.env.DB_USER_NAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	dialect : "mysql",
};
