const mysql = require('mysql2');
const dbconfig = require('../config/db');
// const connection = mysql.createConnection(dbconfig);
const pool = mysql.createPool(dbconfig);
const util = require('util');



// connection.connect(() => {
//     try {
//       console.log("Mysql connect succeed");
//     } catch (err) {
//       throw err;
//     }
//   });



// 콜백 형식 쿼리 실행 기능
const executeQuery = (query, values = [], callback) => {
  pool.execute(query, values, (queryErr, results, fields) => {
    // 쿼리 실행 후 연결을 해제합니다.
    if (queryErr) {
      console.error('Error executing query:', queryErr);
      return callback(queryErr, null);
    }      
      callback(null, results);
    });
};

// promise 버전
const executeQueryPromise = util.promisify(executeQuery);
  




  // 주기적으로 핑을 보내는 타이머 설정 (예: 1분마다)
const sendPing = () => {
  executeQuery('SELECT 1', (err, results) => {
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
    pool,
    sendPing,
    executeQuery,
    executeQueryPromise
}