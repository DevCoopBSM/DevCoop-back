const express = require("express");
const { executeQuery } = require("@query");
const router = express.Router();
router.use(express.json());

router.post("/", (req, res) => {
  const { clientbarcode } = req.body;

  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientbarcode) {
    console.log("clientbarcode is wrong");
    return res.status(400).send("Bad Request: Missing clientbarcode");
  }

  // const sql = "SELECT users.student_number, users.student_name, users.point, pay_log.inner_point, pay_log.type FROM users INNER JOIN pay_log ON users.code_number = pay_log.code_number order by pay_log.date desc limit 10";
  const sql = 'select date, inner_point, type from pay_log where code_number = ? order by date desc limit 100';
  executeQuery(sql, [clientbarcode], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
    //console.log(result);
    return res.status(200).send(result);
  });
});

module.exports = router;
