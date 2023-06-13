const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const dbconfig = require('./config/db')
const cors = require("cors");
const bcrypt = require('bcrypt');

const port = 6002;

const connection = mysql.createConnection(dbconfig)

const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login.js");

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

connection.connect((err) => {
    try {
        console.log("MySQL connect successfully");
    } catch (err) {
        console.log("접속실패...");
    }
})

app.post("/api/pay", (req, res) => {
    const { minusPoint, code_number } = req.body;
    const sql = "update users set point = point - ? where code_number = ? and point - ? >= 0";
    connection.query(sql, [minusPoint, code_number, minusPoint], (err, result) => {
        try {
            return res.status(200).json({ message: "결제를 성공하였습니다" });
        } catch (err) {
            return res.status(500).json({ error: "결제를 실패하였습니다" });
        }
        res.send("point save to database" + result);
    });
});

app.post("/api/charge", (req, res) => {
    const { plusPoint, code_number } = req.body;
    const sql = "update users set point = point + ? where code_number = ?";
    connection.query(sql, [plusPoint, code_number], (err, result) => {
        try {
            return res.status(200).json({ message: "충전을 성공하였습니다" });
        } catch (err) {
            return res.status(500).json({ error: "포인트 충전 실패" });
        }
        res.send("point save to database" + result);
    });
});

app.get("/api/check", (req, res) => {
    const email = req.body;
    const sql =
        "select point from users WHERE email = ?";
    connection.query(sql, [email], (err, result) => {
        try {
            return res.status(200).json({ message: "포인트 조회 성공" });
        } catch (err) {
            return res.status(500).json({ error: "포인트 조회 실패" });
        }
        res.send(result);
    });
});

app.get("/api/studentinfo", (req, res) => {
    const sql = "select student_number, student_name, code_number from users";
    connection.query(sql, (err, result) => {
        try {
            return res.status(200).json({ message: "학생정보 조회에 성공했습니다" });
        } catch (err) {
            return res.status(500).json({ error: "조회를 실패하였습니다" });
        }
        res.send(result);
    });
});

app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);


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
