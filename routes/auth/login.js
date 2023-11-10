const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQueryPromise } = require("@query");
const { genToken, updateRefToken } = require("@token");

router.use(express.json());

async function handleLogin(req, res) {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";

  try {
    const results = await executeQueryPromise(query, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: "이메일이 잘못되었습니다" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "비밀번호가 잘못되었습니다" });
    }

    // 토큰 생성 및 갱신
    const accessToken = await genToken(email, user.student_name, "1h");
    const refreshToken = await genToken(email, user.student_name, "14d");
    await updateRefToken(email, refreshToken);

    // 쿠키에 토큰 설정 및 로그인 상태 쿠키 설정
    res.cookie('accessToken', accessToken, { httpOnly: true })  // httpOnly는 JavaScript를 통한 접근을 제한
       .cookie('refreshToken', refreshToken, { httpOnly: true })
       .cookie('isLoggedIn', 'true', { httpOnly: false, maxAge: 3600000 })
       .status(200)
       .json({
           message: "로그인이 성공적으로 되었습니다",
           name: user.student_name,
           point: user.point,
           email: email,
       });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
}

router.post("/", handleLogin);

module.exports = router;
