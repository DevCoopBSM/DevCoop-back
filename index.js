const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const dbconfig = require('./config/db')
const cors = require("cors");
const bcrypt = require('bcrypt');

const port = 9000;

const connection = mysql.createConnection(dbconfig)

const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login.js");

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

connection.connect((err) => {
    try {
        console.log("Mysql connect...")
    } catch (err) {
        throw err;
    }
})

app.post("/api/pay", (req, res) => {
    const { minusPoint, code_number } = req.body;
    const sql = "update users set point = point - ? where code_number = ? and point - ? >= 0";
    connection.query(sql, [minusPoint, code_number, minusPoint], (err, result) => {
        try {
        } catch (err) {
            throw err;
        }
        res.send("point save to database" + result);
    });
});

app.post("/api/charge", (req, res) => {
    const { plusPoint, code_number } = req.body;
    const sql = "update users set point = point + ? where code_number = ?";
    connection.query(sql, [plusPoint, code_number], (err, result) => {
        try {

        } catch (err) {
            throw err;
        }
        res.send("point save to database" + result);
    });
});

app.get("/api/check", (req, res) => {
    const { email, password } = req.body;
    const sql =
        "select student_name, point from users WHERE email = ? and password = ?";
    connection.query(sql, [email, password], (err, result) => {
        try {

        } catch (err) {
            throw err;
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