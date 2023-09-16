const express = require("express");
const { executeQuery_promise } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
router.use(express.json());
router.use((req, res, next) => checkAdminTokens(req, res, next));


// const genKey = (email, name, expiretime) => {
//   console.log("genToken!")
//   const Payload = {
//       email: email,
//       name: name
//   }
//   const token = jwt.sign(Payload, process.env.SECRET_KEY, { expiresIn: expiretime });
//   //const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
//   //console.log(verifiedToken);
//   return token
// };


router.post("/", async (req, res) => {
  console.log(req.body);
  const { charger, plusPoint, code_number } = req.body;
  console.log(charger, plusPoint, code_number);
  const sql1 =
    "SELECT student_number, point, student_name FROM users WHERE code_number = ?";
  const sql2 =
    'INSERT INTO charge_log VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, "test", ?)';
  const sql3 = "UPDATE users SET point = point + ? WHERE code_number = ?";
  const sql4 = "SELECT point FROM users WHERE code_number = ?";

  try {
    const result1 = await executeQuery_promise(sql1, [code_number]);
    const value1 = result1[0];
    const nowPoint = value1.point;
    const response1 = {
      학번: value1.student_number,
      "원래 금액": nowPoint,
      "충전 금액": plusPoint,
      "학생 이름": value1.student_name,
    };

    await executeQuery_promise(sql2, [
      code_number,
      plusPoint,
      nowPoint,
      charger,
      value1.student_name,
    ]);

    await executeQuery_promise(sql3, [plusPoint, code_number]);

    const result4 = await executeQuery_promise(sql4, [code_number]);
    const value2 = result4[0];
    const response2 = {
      "최종 잔액": value2.point,
      message: "성공",
    };

    const newresponse = { ...response1, ...response2 };
    console.log(newresponse);
    res.status(200).send(newresponse);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;