const mysql = require('mysql2');
const dbconfig = require('../config/db');
const connection = mysql.createConnection(dbconfig);


exports.connection = connection;


