const express = require('express') // NodeJS 웹 프레임워크
const mysql = require('mysql2')
const dbconfig = require('../config/db')
const bcrypt = require('bcrypt');
const router = express.Router();
const port = 9000;

const connection = mysql.createConnection(dbconfig)

router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.promise().query(query, email);

        if (results.length === 0) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다' });
        }

        // 로그인 성공 처리
        console.log("로그인 성공");
        return res.status(200).json({ message: '로그인이 성공적으로 되었습니다' });
    } catch (err) {
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});

module.exports = router;