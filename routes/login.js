const express = require('express') ;// NodeJS 웹 프레임워크
const mysql = require('mysql2');
const dbconfig = require('../config/db');
const bcrypt = require('bcrypt');
const router = express.Router();
// const genToken = require('../utiles/jwt')
const connection = mysql.createConnection(dbconfig);
const token = require('../utiles/token.js');

router.use(express.json());

const updateToken = async(tokentype , email, token ) => {
    const query = `UPDATE users SET ${tokentype} = ?  WHERE email = ?`;
    const [results] = await connection.promise().query(query, [token, email]);
    console.log(results);
}


router.post('/', async (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    console.log(email)

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await connection.promise().query(query, email);
        // console.log(results);
        if (results.length === 0) {
            return res.status(401).json({ error: '이메일  잘못되었습니다' });
        }

        const user = results[0];
        // const isPasswordValid = (password == user.password)
        const isPasswordValid = bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: '비밀번호가 잘못되었습니다' });
        }
        const accessToken = await token.genToken(email, password, "1h");
        const refreshToken = await token.genToken(email, password, "14d");
        updateToken("acc_token", email, accessToken);
        // updateToken("ref_token", email, refreshToken);
        // console.log([accessToken, refreshToken]);
        // console.log("로그인 성공");
        return res.status(200).json({
            message: '로그인이 성공적으로 되었습니다',
            accToken: accessToken,
            refToken: refreshToken
        });


    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});


module.exports = router;