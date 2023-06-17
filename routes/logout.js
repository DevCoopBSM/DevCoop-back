const express = require('express');// NodeJS 웹 프레임워크
const mysql = require('mysql2');
const dbconfig = require('../config/db');
const bcrypt = require('bcrypt');
const router = express.Router();
// const genToken = require('../utiles/jwt')
const connection = mysql.createConnection(dbconfig);
const token = require('../utils/token.js');
router.use(express.json());


router.post('/', async (req, res) => {
    console.log(`${email} logout!`)

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.promise().query(query, email);
        console.log(results);
        if (results.length === 0) {
            return res.status(401).json({ error: '이메일이 잘못되었습니다' });
        }

        const user = results[0];
        // const isPasswordValid = (password == user.password)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            return res.status(401).json({ error: '비밀번호가 잘못되었습니다' });
        }
        const accessToken = await token.genToken(email, user.student_name, "1h");
        const refreshToken = await token.genToken(email, user.student_name, "14d");
        // updateToken("acc_token", email, accessToken);
        token.updateRefToken( email, refreshToken);
        // console.log([accessToken, refreshToken]);
        // console.log("로그인 성공");
        return res.status(200).json({
            message: '로그아웃 되었습니다.',
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});



module.exports = router;
