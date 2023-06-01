const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const dbconfig = require('../config/db')
const bcrypt = require('bcrypt');
const router = express.Router();

const connection = mysql.createConnection(dbconfig);

router.post('/', async (req, res) => {
    const { student_name, email, password } = req.body;
    try {
        const query = 'SELECT email FROM users WHERE email = ?';
        const [results] = await connection.promise().query(query, email);

        if (results.length > 0) {
            return res.status(400).json({
                error: '이미 존재하는 이메일입니다'
            })
        }

        const salt = await bcrypt.genSalt(Number(8));
        const hashedPassword = await bcrypt.hash(String(password), salt);

        const register_values = [student_name, email, hashedPassword];

        const regexp_bssm = /\S+@bssm.hs.kr/;
        const email_test_result = regexp_bssm.test(email);
        if (email_test_result === false) {
            return res.status(400).json({ error: '이메일 형식이 잘못되었습니다' });
        }

        const insert_query = 'INSERT INTO users(student_name, email, password) VALUES (?, ?, ?)';
        connection.query(insert_query, register_values);

        return res.status(200).json({ message: '회원가입이 성공적으로 되었습니다' });
    } catch (err) {
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});

module.exports = router;