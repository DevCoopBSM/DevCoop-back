const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

exports.login = async (req, res) => {
    // console.log(req.body);

    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hashSync(String(password), salt); // 2의 8제곱번 해시함수 적용해서 해시화 함 (보안성이 높아짐)

    try {
        const user = await User.findOne({
            where: {
                email: email,
            }
        });

        if (!user) {
            return res.status(400).send({
                message: "존재하지 않는 사용자입니다"
            });
        }

        const isMatchEmail = await bcrypt.compare(String(email).trim(), String(user.email).trim()); // 요청된 이메일과 DB에 저장된 이메일을 비교합니다
        const isMatchPassword = await bcrypt.compare(String(hashedPassword).trim(), String(user.password).trim()); // 요청된 비밀번호와 DB에 저장된 비밀번호을 비교합니다

        if (!isMatchEmail || !isMatchPassword) {
            return res.status(400).render('login');
        }

        const payload = {
            email: email,
        }; // 정보를 담습니다

        const secret = crypto.randomBytes(32).toString('hex'); // secret 문자열을 16진수 문자열을 32바이트로 생성합니다

        const option = {
            algorithm: 'HS256', // HS256 알고리즘을 사용합니다
            expiresIn: '1h', // 유효기간은 1시간
        };

        try {
            const token = jwt.sign(payload, secret, option); // 토큰을 생성합니다
            const accessToken = jwt.decode(token);

            console.log(accessToken);
        } catch (err) {
            res.status(401).render('Login Failed');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};