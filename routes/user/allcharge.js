const express = require("express");
const { executeQueryPromise } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);

const fetchUserDetailsByCodeNumber = "SELECT student_number, point, student_name, code_number FROM users WHERE code_number IN (?)";
const insertIntoChargeLog = 'INSERT INTO charge_log(code_number, date, type, inner_point, point, charger, verify_key ,student_name) VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, "test", ?)';
const updateUserPoints = "UPDATE users SET point = point + ? WHERE code_number = ?";

router.post("/", async (req, res) => {
  const { code_number, plusPoint, charger } = req.body;

  try {
    const userDetails = await executeQueryPromise(fetchUserDetailsByCodeNumber, [code_number]);

    if (userDetails.length === 0) {
      return res.status(401).json({ error: "해당 결과 없음" });
    }

    for (const data of userDetails) {
      const { code_number: barcode, point: nowPoint, student_name } = data;

      await executeQueryPromise(insertIntoChargeLog, [
        barcode,
        plusPoint,
        nowPoint,
        charger,
        student_name
      ]);
      
      await executeQueryPromise(updateUserPoints, [plusPoint, barcode]);
      console.log(`Inserted data for barcode ${barcode}`);
    }

    console.log("Insertion complete");
    return res.status(200).send("ok");
  } catch (err) {
    console.error("Error in batch insert:", err);
    return res.status(500).json({ error: "Error in batch insert" });
  }
});

module.exports = router;
