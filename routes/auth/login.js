const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQuery } = require("../../utils/query");
const { genToken, updateRefToken } = require("../../utils/token");

router.use(express.json());

async function handleLogin(req, res) {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  try {
    // 데이터베이스에서 사용자 정보 조회
    executeQuery(query, [email], async (err, results) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "이메일이 잘못되었습니다" });
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "비밀번호가 잘못되었습니다" });
      }

      // 토큰 생성 및 갱신
      const accessToken = genToken(email, user.student_name, "1h");
      const refreshToken = genToken(email, user.student_name, "14d");
      updateRefToken(email, refreshToken);

      return res.status(200).json({
        message: "로그인이 성공적으로 되었습니다",
        accToken: accessToken,
        refToken: refreshToken,
        name: user.student_name,
        point: user.point,
      });
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
}

router.post("/", async (req, res) => {
  try {
    await handleLogin(req, res);
  } catch (err) {
    console.error('HandleLogin Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;