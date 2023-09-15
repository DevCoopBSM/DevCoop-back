const express = require("express");
const { executeQuery_promise } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use((req, res, next) => checkAdminTokens(req, res, next));

router.post("/", async (req, res) => {
  const { code_number, plusPoint, charger } = req.body;
  try {
    const placeholders = code_number.map(() => "?").join(", ");
    const sql1 = `SELECT student_number, point, student_name, code_number FROM users WHERE code_number IN (${placeholders})`;
    const sql2 = "INSERT INTO user_log VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, 'test', ?)";
    const sql3 = "UPDATE users SET point = point + ? WHERE code_number = ?";

    const [select_barcode] = await executeQuery_promise(sql1, code_number);

    if (select_barcode.length === 0) {
      return res.status(401).json({ error: "해당 결과 없음" });
    }

    for (const data of select_barcode) {
      const { code_number: barcode, point, student_name: studentName } = data;
      await executeQuery_promise(sql2, [barcode, plusPoint, point, charger, studentName]);
      await executeQuery_promise(sql3, [plusPoint, barcode]);
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