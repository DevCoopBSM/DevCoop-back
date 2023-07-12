const express = require("express");
const {connection} = require("../utils/query")
const {checkAdminTokens} = require('../middlewares/users')
const router = express.Router();
router.use(express.json());
router.use((req, res, next)=> checkAdminTokens(req, res, next));

router.post("/", (req, res) => {
    const { code_number, minusPoint, charger } = req.body;
    console.log(minusPoint);
    const sql1 = "select student_number, point from users where code_number = ?";
    const sql2 = "INSERT INTO user_log VALUES(?, CURRENT_TIMESTAMP, 0, ?, ?, ?,\"test\")";
    const sql3 =
      "update users set point = point - ? where code_number = ? and point - ? >= 0";
  
    const sql4 = "select point from users where code_number = ?";
    connection.query(sql1, [code_number], (err, result1) => {
      if (err) {
        throw err;
      }
      const value = result1[Object.keys(result1)[0]];
      const response1 = {
        학번: value.student_number,
        "이전 잔액": value.point,
        "결제된 금액": minusPoint,
      };
      connection.query(sql2, [code_number, minusPoint, value.point, charger], (err, result2)=>{
        if(err){
          throw err;
        }
      connection.query(
        sql3,
        [minusPoint, code_number, minusPoint],
        (err, result3) => {
          if (err) {
            throw err;
          }
          connection.query(sql4, [code_number], (err, result4) => {
            if (err) {
              throw err;
            }
            const value2 = result4[Object.keys(result4)[0]];
            const response2 = {
              "현재 잔액": value2.point,
              message: "성공",
            };
            const newresponse = { ...response1, ...response2 };
            console.log(newresponse);
            return res.status(200).send(newresponse);
          });
        }
      );
    });
  });
});

module.exports = router;

