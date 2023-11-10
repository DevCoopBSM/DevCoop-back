const express = require("express");
const { executeQuery } = require("../../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { clientname } = req.query;
  console.log(clientname)
  // 클라이언트가 잘못된 값을 보낸 경우 처리
  if (!clientname) {
    console.log("clientbarcode is wrong");
    return res.status(400).send("Bad: Missing clientbarcode");
  }

  const sql = `select date, inner_point, type from charge_log where student_name = ? and type = 1 order by date desc limit 10`;
  executeQuery(sql, [clientname], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    return res.status(200).json(result);

  });
});

module.exports = router;
