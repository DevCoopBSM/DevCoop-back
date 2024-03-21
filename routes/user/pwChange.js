const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQuery, excuteQueryPromise } = require("@query"); 

router.use(express.json());
router.post("/", async (req, res) => {
  const { newPw, email } = req.body;
  const query = 'UPDATE users SET password = ? where email = ?';
  try {
    const salt = 8;
    const hashedPassword = await bcrypt.hash(String(newPw), salt);
    executeQueryPromise(query, [hashedPassword, email], async(err, results) => {
      if(err) {
        console.log('Database Error : ', err);
        return res.status(500).json({ error : "내부 서버 오류 발생" });
      }
      return res.status(200).json({ message : "회원 가입이 성공적으로 완료되었습니다!" });
    })
  } catch(err) {
    return res.status(500).json({ error : "내부 서버 오류 발생" });
  }
})

module.exports = router;