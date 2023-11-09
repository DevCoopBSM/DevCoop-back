const express = require("express");
const { executeQuery } = require("../../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { id } = req.query;
  console.log("Received ID:", id); // 쿼리 파라미터 id 값 로깅

  const sql = `select inner_point, users.point, users.point-inner_point as total, users.student_name 
    from charge_log, users  
    where charge_log.code_number = ? and users.code_number = charge_log.code_number and charge_log.type = 0
    order by date desc limit 1`;

  // executeQuery에 id를 배열로 전달
  executeQuery(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "내부 서버 에러가 발생하였습니다",
      });
    }

    if (result && result.length > 0) {
      const value1 = result[0];  // 수정된 부분
      return res.status(200).json({
        message: "결제완료",
        inner_point: value1.inner_point,
        point: value1.point,
        total: value1.total,
        name: value1.student_name,
      });
    } else {
      return res.status(404).json({ // 404 Not Found 적절한 상황에 맞게 수정된 응답 코드
        message: "결과를 찾을 수 없습니다.",
      });
    }
  });
});

module.exports = router;