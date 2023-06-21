const mysql = require('mysql2');
const dbconfig = require('../config/db');
const connection = mysql.createConnection(dbconfig);
let pool = mysql.createPool(dbconfig);

function getConnection(callback) {
    pool.getConnection(function (err, conn) {
        if(!err) {
            callback(conn);
        }
    });
}

exports.connection = connection;

exports.getConnection = getConnection;
