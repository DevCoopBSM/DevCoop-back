const express = require("express"); // NodeJS 웹 프레임워크
const bcrypt = require("bcrypt");
const router = express.Router();
const { connection } = require("../../utils/query");
const { genToken, updateRefToken } = require("../../utils/token");
router.use(express.json());

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    // console.log(connection)
    const [results] = await connection.promise().query(query, email);
    console.log(results);
    if (results.length === 0) {
      return res.status(401).json({ error: "이메일이 잘못되었습니다" });
    }

    const user = results[0];
    // const isPasswordValid = (password == user.password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "비밀번호가 잘못되었습니다" });
    }
    const accessToken = await genToken(email, user.student_name, "1h");
    const refreshToken = await genToken(email, user.student_name, "14d");
    // updateToken("acc_token", email, accessToken);
    updateRefToken(email, refreshToken);
    // console.log([accessToken, refreshToken]);
    // console.log("로그인 성공");
    return res.status(200).json({
      message: "로그인이 성공적으로 되었습니다",
      accToken: accessToken,
      refToken: refreshToken,
      name: user.student_name,
      point: user.point,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
  }
});

module.exports = router;
