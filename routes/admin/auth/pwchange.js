const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { executeQuery, executeQueryPromise } = require("@query");

router.use(express.json());

router.post("/", async (req, res) => {
    const { newPW, email } = req.body;
    const query = 'UPDATE users SET password = ? where email = ?';
    try {
        const salt = 8;
        const hashedPassword = await bcrypt.hash(String(newPW), salt);
        executeQueryPromise(query, [hashedPassword, email], async (err, results) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
            }
            
            return res.status(200).json({ message: "회원가입이 성공적으로 되었습니다" });
        })
    } catch(err) {
        return res.status(500).json({ error: "내부 서버 오류가 발생하였습니다" });
    }
})

module.exports = router;