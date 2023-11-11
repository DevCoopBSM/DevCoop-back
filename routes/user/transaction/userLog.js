const express = require("express");
const { executeQuery } = require("@query");
const router = express.Router();
router.use(express.json());


router.get("/", (req, res) => {
  const { clientbarcode, type } = req.query;
  // console.log(req.query)
  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientbarcode) {
    console.log("clientbarcode is wrong");
    return res.status(400).send("Bad: Missing clientbarcode");
  }
  if (type != 0 & type != 1) {
    console.log("type is wrong");
    return res.status(400).send("Bad: log type is wrong");
  }
  let tableName = type == 1 ? "charge_log" : "pay_log";
  if (!["charge_log", "pay_log"].includes(tableName)) {
    // tableName이 유효하지 않은 경우 오류 처리
    return res.status(400).send("Invalid table name");
  }
  const sql = `SELECT date, inner_point, type FROM ${tableName} WHERE code_number = ? ORDER BY date DESC LIMIT 10`;
  executeQuery(sql, [clientbarcode], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
    console.log(result)
    return res.status(200).json(result);

  });
});

module.exports = router;
