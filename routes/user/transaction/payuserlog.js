const express = require("express");
const { executeQuery } = require("../../../utils/query");
const router = express.Router();
router.use(express.json());
const sql = `select date, inner_point, type from pay_log where student_name = ? and type = 0 order by date desc limit 10`;
router.get("/", async (req, res) => {
  const { clientname } = req.query;
  console.log(clientname);
  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientname) {
    console.log("clientbarcode is wrong");
    return res.status(400).send("Bad: Missing clientbarcode");
  }
  try {
    const result = executeQuery(sql, [clientname]);
    return res.status(200).json(result);
  } catch (error) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
  // const sql = "SELECT users.student_number, users.student_name, users.point, charge_log.inner_point, charge_log.type FROM users INNER JOIN charge_log ON users.code_number = charge_log.code_number order by charge_log.date desc limit 10";

  // console.log(result);
  //  // 결과가 배열 형태로 반환되므로 배열 형태로 응답을 구성합니다.
  //  const responseData = results.map((result) => ({
  //   date: result.date,
  //   inner_point: result.inner_point,
  //   type: result.type,
  // }));

  // console.log(responseData);
});

module.exports = router;
