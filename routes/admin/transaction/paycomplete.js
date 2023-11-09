const express = require("express");
const { executeQuery } = require("../../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { id } = req.query;
  //if(type == 0){
  console.log("get success");
  const sql = `select inner_point, users.point, users.point-inner_point as total, users.student_name 
    from pay_log, users  
    where pay_log.code_number = ? and users.code_number = pay_log.code_number and pay_log.type = 0
    order by date desc limit 1`;
  console.log("check");

  executeQuery(sql, [id], (err, result) => {
    if (err) throw err;
    console.log("show");

    if (result && result.length > 0) {
      const value1 = result[Object.keys(result)[0]];
      const new_inner_point = value1.inner_point;
      const new_point = value1.point;
      const new_total = value1.total;
      const new_name = value1.student_name;

      console.log(value1);
      return res.status(200).json({
        message: "결제완료",
        inner_point: new_inner_point,
        point: new_point,
        total: new_total,
        name: new_name,
      });
    } else {
      return res.status(500).json({
        message: "내부 서버 에러가 발생하였습니다",
      });
    }
  });
  // else{
  //     return res.status(400).json({
  //         message:"잘못된 요청입니다."
  //     })
  // }
});

module.exports = router;
