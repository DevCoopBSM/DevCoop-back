const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const path = require('path')
const db = require('./config/db')
const cors = require("cors");

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

app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

app.post("/api/pay", (req, res) => {
    const { minusPoint, code_number } = req.body;
    console.log(minusPoint);
    const sql = "update users set point = point - ? where code_number = ?";
    connection.query(sql, [minusPoint, code_number], (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      res.send("point save to database" + result);
    });
});

app.post("/api/charge", (req, res) => {
    const { plusPoint, code_number } = req.body;
    console.log(plusPoint);
    const sql = "update users set point = point + ? where code_number = ?";
    connection.query(sql, [plusPoint, code_number], (err, result) => {
        if (err) {
        throw err;
        }
        console.log(result);
        res.send("point save to database" + result);
    });
});

app.get("/api/check", (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    const sql =
        "select student_name, point from users WHERE email = ? and password = ?";
    connection.query(sql, [email, password], (err, result) => {
        if (err) {
        throw err;
        }
        console.log(result);
        res.send(result);
    });
});

app.listen(port, (req, res) => {
    console.log(`WEB Server is running on port ${port}`)
});