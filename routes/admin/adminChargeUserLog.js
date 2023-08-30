const express = require("express");
const { connection } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.post("/", (req, res) => {
  const { clientbarcode } = req.body;

  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientbarcode) {
    return res.status(400).send("Bad Request: Missing clientbarcode");
  }

  // const sql = "SELECT users.student_number, users.student_name, users.point, user_log.inner_point, user_log.type FROM users INNER JOIN user_log ON users.code_number = user_log.code_number order by user_log.date desc limit 10";
  const sql = `select date, inner_point, type from user_log where code_number = ${clientbarcode} and type = 1 order by date desc limit 10`;
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    return res.status(200).send(result);
  });
});

module.exports = router;
