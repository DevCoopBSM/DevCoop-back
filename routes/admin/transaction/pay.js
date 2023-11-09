const express = require("express");
const { executeQueryPromise } = require("../../../utils/query");
const { checkAdminTokens } = require("../../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);

router.post("/", async (req, res) => {
  const { code_number, minusPoint, charger } = req.body;
  const selectUserQuery = "SELECT student_number, point, student_name FROM users WHERE code_number = ?";
  const insertPayLogQuery = 'INSERT INTO pay_log(code_number, date, type, inner_point, point, charger, verify_key ,student_name) VALUES(?, CURRENT_TIMESTAMP, 0, ?, ?, ?, "test", ?)';
  const updateUserPointQuery = "UPDATE users SET point = point - ? WHERE code_number = ? and point - ? >= 0";
  const selectUserPointQuery = "SELECT point FROM users WHERE code_number = ?";

  if(minusPoint <= 0 | !minusPoint){
    console.log(minusPoint);
    return res.status(400).json({error:"결제하는 값이 0이하입니다."});
  }
  try {
    const userResult = await executeQueryPromise(selectUserQuery, [code_number]);
    const value = userResult[0];
    const initialResponse = {
      student_number: value.student_number,
      oldPoint : value.point,
      minusPoint: minusPoint,
      student_name: value.student_name,
    };
    
    if (value.point - minusPoint < 0) {
      return res.status(400).json({ message: "잘못된 요청입니다. 잔액초과" });
    }

    await executeQueryPromise(insertPayLogQuery, [code_number, minusPoint, value.point, charger, value.student_name]);
    await executeQueryPromise(updateUserPointQuery, [minusPoint, code_number, minusPoint]);
    
    const pointResult = await executeQueryPromise(selectUserPointQuery, [code_number]);
    const updatedValue = pointResult[0];
    const finalResponse = {
      newPoint: updatedValue.point,
      message: "success",
    };

    const response = { ...initialResponse, ...finalResponse };
    console.log(response);
    return res.status(200).send(response);
    
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
