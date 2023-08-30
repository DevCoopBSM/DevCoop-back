const express = require("express");
const { connection } = require("../../utils/query");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();
router.use(express.json());
router.use((req, res, next) => checkAdminTokens(req, res, next));

router.post("/", async (req, res) => {
  const { code_number, plusPoint, charger } = req.body;

  try {
    const placeholders = Array.from(
      { length: code_number.length },
      () => "?"
    ).join(", ");
    const sql1 = `select student_number, point, student_name, code_number from users where code_number in (${placeholders})`; //5000
    const sql2 = `INSERT INTO user_log VALUES(?, CURRENT_TIMESTAMP, 1, ?, ?, ?, "test",?)`;
    const sql3 = "update users set point = point + ? where code_number = ?";
    const [select_barcode] = await connection
      .promise()
      .query(sql1, code_number);
    if (select_barcode.length === 0) {
      return res.status(401).json({ error: "해당 결과 없음" });
    }
    for (const data of select_barcode) {
      const barcode = data.code_number;
      const point = data.point;
      const studentName = data.student_name;
      await connection
        .promise()
        .query(sql2, [barcode, plusPoint, point, charger, studentName]);
      await connection.promise().query(sql3, [plusPoint, barcode]);
    }
    return res.status(200).send("ok");
  } catch (err) {
    res.status(500).json({ error: "Error in batch insert" });
  }
});

module.exports = router;
