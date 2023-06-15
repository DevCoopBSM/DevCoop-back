const express = require("express");
const passport = require('passport');
const mysql = require('mysql');
const dbconfig = require('./config/db');
const connection = mysql.createConnection(dbconfig);
const router = express.Router();
const app = express();
const cors = require('cors');
const {verifyToken} = require('./utils/token')
app.use(express.json());

const port = 6002;

const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const meRouter = require("./routes/me")

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

app.post("/api/charge", (req, res) => {
    const { plusPoint, code_number } = req.body;
    const sql = "update users set point = point + ? where code_number = ?";
    connection.query(sql, [plusPoint, code_number], (err, result) => {
        try {
            return res.status(200).json({ message: "충전을 성공하였습니다" });
        } catch (err) {
            return res.status(500).json({ error: "포인트 충전 실패" });
        }
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
    });
});

app.get("/api/studentinfo", (req, res) => {
    const verifyedToken = verifyToken(req.header('Authorization'))
    console.log(verifyedToken)
        if (verifyedToken != null) {
        const email = verifyedToken.email
        const sql = `select student_number, student_name, code_number, point from users WHERE email = '${email}' `;
        connection.query(sql, (err, result) => {
            try {
                const user = result[0]
                return res.status(200).json({ 
                    message: "학생정보 조회에 성공했습니다",
                    number: user.student_number,
                    name: user.student_name,
                    code: user.code,
                    point: user.point
                 });
            } catch (err) {
                return res.status(500).json({ error: "조회를 실패하였습니다" });
            }
        })
    }   
});


app.post("/api/pays", (req, res) => {
    const { code_number, minusPoint } = req.body;
    console.log(minusPoint);
    const sql1 = "select student_number, point from users where code_number = ?";
    const sql2 =
      "update users set point = point - ? where code_number = ? and point - ? >= 0";
    const sql3 = "select point from users where code_number = ?";
    connection.query(sql1, [code_number], (err, result1) => {
      if (err) {
        throw err;
      }
      const value = result1[Object.keys(result1)[0]];
      const response1 = {
        학번: value.student_number,
        "이전 잔액": value.point,
        "결제된 금액": minusPoint,
      };
      connection.query(
        sql2,
        [minusPoint, code_number, minusPoint],
        (err, result2) => {
          if (err) {
            throw err;
          }
          connection.query(sql3, [code_number], (err, result3) => {
            if (err) {
              throw err;
            }
            const value2 = result3[Object.keys(result3)[0]];
            const response2 = {
              "현재 잔액": value2.point,
              message: "성공",
            };
            const newresponse = { ...response1, ...response2 };
            console.log(newresponse);
            return res.status(200).send(newresponse);
          });
        }
      );
    });
  });


app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/me", meRouter);

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
