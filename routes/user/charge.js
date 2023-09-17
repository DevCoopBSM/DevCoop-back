const express = require("express");
const { executeQueryPromise } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
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
      학번: student_number,
      "원래 금액": nowPoint,
      "충전 금액": plusPoint,
      "학생 이름": student_name,
      "최종 잔액": updatedPoint[0].point,
      message: "성공"
    };

    res.status(200).send(response);
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;
