const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const path = require('path')
const db = require('./config/db')
const cors = require("cors");
const bcrypt = require('bcrypt');

const port = 9000;

const connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
})

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('MySQL connected...')
    }
})

app.post('/api/signup', async (req, res) => {
    const { student_name, email, password } = req.body;
    const sql = 'SELECT email FROM users WHERE email = ?';
    try {

        const [results] = await connection.promise().query(sql, email);

        if (results.length > 0) {
            return res.status(400).json({
                error: '이미 존재하는 이메일입니다'
            })
        }

        const salt = await bcrypt.genSalt(Number(8));
        const hashedPassword = await bcrypt.hash(String(password), salt);
        console.log(hashedPassword);

        const register_values = [student_name, email, hashedPassword];

        const regexp_bssm = /\S+@bssm.hs.kr/;
        const email_test_result = regexp_bssm.test(email);
        if (email_test_result === false) {
            return res.status(400).json({ error: '이메일 형식이 잘못되었습니다' });
        }

        const query = 'INSERT INTO users(student_name, email, password) VALUES (?, ?, ?)'
        connection.query(query, register_values);

        console.log('User registered successfully');
        return res.status(200).json({ message: '회원가입이 성공적으로 되었습니다' });
    } catch (err) {
        return res.status(500).json({ error: '내부 서버 오류' });
    }
});

app.post('/api/login', async (req, res) => {
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
        console.log("로그인 성공")
        return res.status(200).json({ message: '로그인이 성공적으로 되었습니다' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});


// CORS 하용 설정하기.
app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});


app.listen(port, () => {
    console.log(`WEB Server is running on port ${port}`)
});