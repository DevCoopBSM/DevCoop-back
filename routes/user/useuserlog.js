const express = require("express");
const { connection } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { clientname } = req.query;

  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientname) {
    console.log("clientbarcode is wrong");
    return res.status(400).send("Bad Request: Missing clientbarcode");
  }

  // const sql = "SELECT users.student_number, users.student_name, users.point, user_log.inner_point, user_log.type FROM users INNER JOIN user_log ON users.code_number = user_log.code_number order by user_log.date desc limit 10";
  const sql = `select date, inner_point, type from user_log where student_name = ? and type = 0 order by date desc limit 10`;
  connection.query(sql, clientname, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
    console.log(result);
    return res.status(200).send(result);
  });
});

module.exports = router;
