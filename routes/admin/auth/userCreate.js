const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQueryPromise } = require("@query");

router.post("/", async(req, res) => {
  const { code_number, student_name, email, password, pwCheck, is_admin, is_coop } = req.body;

  try {
    const query = "SELECT email FROM users WHERE email = ?";
    const [results] = await executeQueryPromise(query, [email]);

    if (results.length > 0) {
      return res.status(400).json({
        error : "이미 존재하는 이메일입니다.",
      });
    }

    if (password !== pwCheck) {
      return res.status(400).json({ error : "비밀번호가 일치하지 않습니다." });
    }

    const salt = await bcrypt.genSalt(Number(8));
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const point = 0;
    const register_values = [ code_number, student_name, email, hashedPassword, point, is_admin, is_coop ]; 

    const regexp_bssm = /\S+@bssm.hs.kr/;
    const email_test_result = regexp_bssm.test(email);
    if (!email_test_result) { 
      return res.status(400).json({ error : "이메일 형식이 잘못되었습니다. "});
    }

    const insert_query = "INSERT INTO users(code_number, student_name, email, password, point, is_admin, is_coop) VALUES (?, ?, ?, ?, ?, ?, ?)";
    executeQueryPromise(insert_query, [register_values]);

    return res.status(200).json({ message : "회원가입이 성공적으로 되었습니다!" });
  } catch(err) {
    return res.status(500).json({ error : "내부 서버 오류 발생" });
  }
});

module.exports = router;