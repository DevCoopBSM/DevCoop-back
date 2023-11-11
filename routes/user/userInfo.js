const express = require("express");
const router = express.Router();
const { verifyToken, checkTokens } = require("@token");

const { Users } = require("@models");  // Sequelize 모델이 정의된 디렉토리를 가리킵니다.


router.use(express.json());
router.use(checkTokens);


router.post("/", async (req, res) => {
  try {
    const verifiedToken = verifyToken(req.cookies.accessToken);
    const email = verifiedToken.email;
    
    // Sequelize의 findOne 메서드를 사용하여 DB에서 사용자 조회
    const user = await Users.findOne({
      where: { email: email },
      attributes: ['student_number', 'student_name', 'code_number', 'point']  // 조회할 컬럼 지정
    });

    // 사용자가 존재하는 경우, 조회한 데이터를 JSON 형태로 응답
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "조회를 실패하였습니다" });
  }
});

module.exports = router;
