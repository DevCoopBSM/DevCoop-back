const express = require('express') // NodeJS 웹 프레임워크
const mysql = require('mysql2')
const dbconfig = require('../config/db')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const connection = mysql.createConnection(dbconfig);

router.use(express.json())

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

        const Header = {
            type: "JWT"
        };

        const encodedHeader = Buffer.from(JSON.stringify(Header)).toString('base64');

        const salt = await bcrypt.genSalt(Number(8));
        const hashedPassword = await bcrypt.hash(String(password), salt);

        const Payload = {
            email: email,
            password: hashedPassword
        }

        const encodedPayload = Buffer.from(JSON.stringify(Payload)).toString('base64');

        function generateRandomString(length) {
            const randomBytes = crypto.randomBytes(length);
            return randomBytes.toString('base64').slice(0, length);
        } // secret key 랜덤 문자열 생성

        const secretKey = generateRandomString(32);
        const expiresIn = '1h'; // 1시간 후에 토큰이 만료됨

        const signature = crypto
            .createHmac("sha256", secretKey, { expiresIn })
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64")
            .replace(/=/g, "");


        const token = `${encodedHeader}.${encodedPayload}.${signature}`;
        console.log(token)

        // // 로그인 성공 처리
        // console.log("로그인 성공");
        return res.status(200).json({
            message: '로그인이 성공적으로 되었습니다',
            jwt: token
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});

module.exports = router;
