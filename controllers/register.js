const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const db = require('../config/db');

const connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
})

exports.register = async (req, res) => {
    const { student_name, email, password } = req.body;
    console.log(req.body)

    const [results] = await connection.promise().query('select email from users where email = ?', email); // 이미 존재하는 이메일인지 확인

    if (results.length > 0) {
        console.log(results);
        return res.end();
    }

    const salt = await bcrypt.genSalt(Number(8));
    const hashedPassword = await bcrypt.hash(String(password), salt); // 2의 8제곱번 해시함수 적용해서 해시화 함 (보안성이 높아짐)
    console.log(hashedPassword);

    const register_values = [student_name, email, hashedPassword]

    const re = /\S+@bssm.hs.kr/; // 정규식을 활용하여 학교이메일 계정인지 확인합니다
    const email_test_result = re.test(email);
    if (email_test_result === false) {
        alert('학교 이메일 형식이 아닙니다');
        return res.end();
    }
    connection.query('insert into users(student_name, email, password) values(?, ?, ?)', register_values, (err, results) => {
        if (err) {
            console.log(err);
        } else {
            console.log(results);
            return res.end();
        }
    })
}


