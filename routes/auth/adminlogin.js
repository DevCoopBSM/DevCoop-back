const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQueryPromise } = require("../../utils/query");
const { genToken, updateRefToken } = require("../../utils/token");

router.use(express.json());

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const results = await executeQueryPromise(query, email);

    if (results.length === 0) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 잘못되었습니다" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 잘못되었습니다" });
    }

    if (user.is_admin !== 1) {
      return res.status(403).json({ error: "관리자가 아닙니다" });
    }

    const accessToken = await genToken(email, user.student_name, "1h");
    const refreshToken = await genToken(email, user.student_name, "14d");
    await updateRefToken(email, refreshToken);

    // 쿠키에 토큰 및 로그인 상태 저장
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('isAdminLoggedIn', 'true', { httpOnly: false, maxAge: 3600000 });
    res.cookie('isLoggedIn', 'true', { httpOnly: false, maxAge: 3600000 }); 

    return res.status(200).json({
      message: "로그인이 성공적으로 되었습니다",
      name: user.student_name,
      point: user.point,
      admin: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;
