const dotenv = require("dotenv");
dotenv.config();

module.exports = {
	host: "DevCoop_MySql",
	port: 3306,
	user: process.env.DB_USER_NAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections : true,
	connectionLimit: 30,
	queueLimit: 0,
	// debug: true
};
