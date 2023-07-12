const express = require("express");
const {connection} = require("../utils/query");
const router = express.Router();
router.use(express.json());

router.get('/', (req, res)=>{
    const sql = "SELECT users.student_number, users.student_name, users.point, user_log.inner_point, user_log.type FROM users INNER JOIN user_log ON users.code_number  = user_log.code_number order by user_log.date desc limit 10";
    connection.query(sql, (err, result)=>{
      if(err){
        throw err;
      }
      console.log(result);
      return res.status(200).send(result);
    });
});

module.exports = router;
