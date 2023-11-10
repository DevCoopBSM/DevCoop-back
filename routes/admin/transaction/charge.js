const express = require("express");
const { executeQueryPromise } = require("@query");
const { checkAdminTokens } = require("@token");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);

const fetchUserDetailsByCodeNumber = "SELECT student_number, point, student_name FROM users WHERE code_number = ?";
const insertIntoChargeLog = 'INSERT INTO charge_log(code_number, date, type, inner_point, point, charger, verify_key ,student_name) VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, "test", ?)';
const updateUserPoints = "UPDATE users SET point = point + ? WHERE code_number = ?";
const fetchUpdatedUserPoint = "SELECT point FROM users WHERE code_number = ?";
router.post("/", async (req, res) => {
  const { charger, plusPoint, code_number } = req.body;
  if(plusPoint <= 0 | !plusPoint){
    console.log(plusPoint);
    return res.status(400).json({error:"충전값이 0이하입니다."});
  }
  try {
    const userDetails = await executeQueryPromise(fetchUserDetailsByCodeNumber, [code_number]);
    const { student_number, point: nowPoint, student_name } = userDetails[0];

    await executeQueryPromise(insertIntoChargeLog, [
      code_number,
      plusPoint,
      nowPoint,
      charger,
      student_name,
    ]);

    await executeQueryPromise(updateUserPoints, [plusPoint, code_number]);

    const updatedPoint = await executeQueryPromise(fetchUpdatedUserPoint, [code_number]);

    const response = {
      student_number: student_number,
      oldPoint: nowPoint,
      plusPoint: plusPoint,
      student_name: student_name,
      newPoint: updatedPoint[0].point,
      message: "success"
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;
