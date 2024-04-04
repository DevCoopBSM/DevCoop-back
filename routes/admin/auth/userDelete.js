const express = require("express");
// const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQueryPromise } = require("@query");

router.post("/", async(req, res) => {
  // 유저 삭제의 경우 버튼 > 삭제하기 > 경고 팝업 > 삭제 
  const { code_number } = req.body;

  try {
    const query = "SELECT student_number FROM users WHERE code_number = ?";
    const [result] = await executeQueryPromise(query, [code_number]);

    if(!result) { // if문 조건에 뭐가 더 필요할까?
      return res.status(400).json({ error : "존재하지 않는 사용자입니다." });
    }

    query = "DELETE FROM users WHERE code_number = ?";
    result = await executeQueryPromise(query, [code_number]);

    return res.status(200).json({ message : "회원 삭제가 정상적으로 완료되었습니다." });
  } catch(err) {
    return res.status(500).json({ error : "내부 서버 오류 발생" });
  }
})

module.exports = router;