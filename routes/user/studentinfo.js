const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../utils/token");
const { executeQueryPromise } = require("../../utils/query");  // 가정: executeQueryPromise는 Promise 버전의 executeQuery

router.use(express.json());
const { checkTokens } = require("../../middlewares/users");
router.use((req, res, next) => checkTokens(req, res, next));

router.post("/", async (req, res) => {
  try {
    const verifyedToken = verifyToken(req.cookies.accessToken);
    const email = verifyedToken.email;
    const sql = 'select student_number, student_name, code_number, point from users WHERE email = ? ';
    console.log(email);

    const result = await executeQueryPromise(sql, [email]);  // 가정: executeQueryPromise를 사용하여 Promise 패턴으로 DB 조회
    return res.status(200).json(result[0]);
    
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "조회를 실패하였습니다" });
  }
});

module.exports = router;
