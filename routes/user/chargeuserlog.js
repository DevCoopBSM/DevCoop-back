const express = require("express");
const { connection } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { clientname } = req.query;

  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientname) {
    return res.status(400).send("Bad Request: Missing clientbarcode");
  }
  const sql = `select date, inner_point, type from user_log where student_name = ? and type = 1 order by date desc limit 10`;
  connection.query(sql, clientname, (err, result) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    return res.status(200).send(result);
  });
});

module.exports = router;
