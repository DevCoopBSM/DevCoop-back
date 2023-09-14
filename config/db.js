const dotenv = require("dotenv");
dotenv.config();

module.exports = {
	  host: "127.0.0.1",
	  port: 6006,
	  user: process.env.DB_USER_NAME,
	  password: process.env.DB_PASSWORD,
	  database: process.env.DB_NAME,
	  waitForConnections : true,
	  connectionLimit: 30,
	  queueLimit: 0
};
