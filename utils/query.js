const mysql = require('mysql2');
const dbconfig = require('../config/db');
const connection = mysql.createConnection(dbconfig);
const pool = mysql.createPool(dbconfig);


connection.connect(() => {
    try {
      console.log("Mysql connect...");
    } catch (err) {
      throw err;
    }
  });

  // 콜백 형식 쿼리 실행 기능
const executeQuery = (query, values = [], callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return callback(err, null);
    }

    connection.query(query, values, (err, results, fields) => {
      connection.release(); // 연결을 해제합니다.

      if (err) {
        console.error('Error executing query:', err);
        return callback(err, null);
      }

      callback(null, results);
    });
  });
}
  

  // 주기적으로 핑을 보내는 타이머 설정 (예: 1분마다)
const sendPing = () => {
connection.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Error pinging MySQL:', err);
    } else {
        console.log('MySQL ping successful');
    }
    });
}


const pingInterval = 60*60*1000; // 1시간 마다
setInterval(sendPing, pingInterval);

process.on('SIGINT', () => {
    console.log('Closing MySQL connection...');
    connection.end((err) => {
      if (err) {
        console.error('Error closing MySQL connection:', err);
      } else {
        console.log('MySQL connection closed');
      }
      process.exit();
    });
  });
  

module.exports = {
    connection,
    pool,
    sendPing,
    executeQuery
}