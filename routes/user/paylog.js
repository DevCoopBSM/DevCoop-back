const express = require("express");
const { executeQuery } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { id } = req.query;
  console.log("get paylog success");
  const sql = `SELECT date, CAST(point AS SIGNED) AS point, inner_point, CAST(point - inner_point AS SIGNED) AS total
  FROM pay_log
  WHERE code_number = ? AND type = 0
  ORDER BY date DESC
  LIMIT 10;`;
  executeQuery(sql, [id], (err, result) => {
    if (err) throw err;
    if (result && result.length > 0) {
      return res.status(200).send(result);
    } else {
      return res.status(500).json({
        message: "내부 서버 에러가 발생하였습니다",
      });
    }
  });
});

module.exports = router;
