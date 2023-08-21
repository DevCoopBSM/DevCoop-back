const express = require("express");
const { connection } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();
router.use(express.json());
router.use((req, res, next) => checkAdminTokens(req, res, next));

router.post("/", (req, res) => {
  console.log(req.body);
  const { charger, plusPoint, code_number } = req.body;
  console.log(charger, plusPoint, code_number);
  const sql1 =
    "select student_number, point, student_name from users where code_number = ?"; //5000
  const sql2 =
    'INSERT INTO user_log VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, "test",?)';
  const sql3 = "update users set point = point + ? where code_number = ?"; //-1000
  const sql4 = "select point from users where code_number = ?"; //4000 //4000 4000 4000 -2000 2000??
  connection.query(sql1, [code_number], (err, result1) => {
    if (err) {
      throw err;
    }
    const value1 = result1[Object.keys(result1)[0]];
    const now_point = value1.point;
    const response1 = {
      학번: value1.student_number,
      "원래 금액": value1.point,
      "충전 금액": plusPoint,
      "학생 이름": value1.student_name,
    };
    connection.query(
      sql2,
      [code_number, plusPoint, value1.point, charger, value1.student_name],
      (err, result2) => {
        if (err) {
          throw err;
        }
        connection.query(sql3, [plusPoint, code_number], (err, result3) => {
          if (err) {
            throw err;
          }
          connection.query(sql4, [code_number], (err, result4) => {
            if (err) {
              throw err;
            }
            const value2 = result4[Object.keys(result4)[0]];
            const response2 = {
              "최종 잔액": value2.point,
              message: "성공",
            };
            const newresponse = { ...response1, ...response2 };
            console.log(newresponse);
            res.status(200).send(newresponse);
          });
        });
      }
    );
  });
});

module.exports = router;
