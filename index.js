const express = require("express");
// const passport = require('passport');
const {connection, pool} = require('./utils/query')
// const router = express.Router();
const app = express();
const cors = require('cors');
// const {verifyToken} = require('./utils/token')


app.use(express.json());

const port = 6002

const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const meRouter = require("./routes/me")
const stinfoRouter = require("./routes/stinfo")
const adminloginRouter = require("./routes/adminlogin");

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

// app.post("/api/charge", (req, res) => {
//     const { plusPoint, code_number } = req.body;
//     const sql = "update users set point = point + ? where code_number = ?";
//     connection.query(sql, [plusPoint, code_number], (err, result) => {
//         try {
//             return res.status(200).json({ message: "충전을 성공하였습니다" });
//         } catch (err) {
//             return res.status(500).json({ error: "포인트 충전 실패" });
//         }
//     });
// });

app.get("/api/check", (req, res) => {
    const {code_number} = req.body;
    const sql ="select point, student_number from users WHERE code_number = ?";
    connection.query(sql, [code_number] , (err, result) => {
        try {
            return res.status(200).json({
              message: "success",
              users: result
            });
        } catch (err) {
            return res.status(500).json({ 
              message: "success fail",
              error: err
             });
        }
    });
});

app.post("/api/charge", (req, res) => {
  const {plusPoint, code_number } = req.body;
  console.log(plusPoint, code_number);
  const sql1 = "select student_number, point from users where code_number = ?"; //5000
  const sql2 = "update users set point = point + ? where code_number = ?"; //-1000
  const sql3 = "select point from users where code_number = ?"; //4000 //4000 4000 4000 -2000 2000??
  connection.query(sql1, [code_number], (err, result1) => {
    if (err) {
      throw err;
    }
    const value1 = result1[Object.keys(result1)[0]];  
    const now_point = value1.point;
    const response1 = {
      학번: value1.student_number,
      "원래 금액": value1.point,
      "충전 금액": plusPoint,
    };
    connection.query(sql2, [plusPoint, code_number], (err, result2) => {
      if (err) {
        throw err;
      }
      connection.query(sql3, [code_number], (err, result3) => {
        if (err) {
          throw err;
        }
        const value2 = result3[Object.keys(result3)[0]];
        const response2 = {
          "최종 잔액": value2.point,
          message: "성공",
        };  
        const newresponse = { ...response1, ...response2 };
        console.log(newresponse);
        res.status(200).send(newresponse);
      });
    });
  });
});


// app.post("/api/charge", async(req, res) => {
//     const { code_number, plusPoint } = req.body;
//     console.log(plusPoint);
//     try {
//         await connection.beginTransaction();
//         const sql1 = "select student_number, point from users where code_number = ?";
//         const sql2 = "insert into log values(?, ?, ?, ?)";
//         const sql3 = "update users set point = point + ? where code_number = ?";
//         const sql4 = "select point from users where code_number = ?";

//         const select = await connection.query(sql1, [code_number]);
//         const upd = await connection.query(sql3, [plusPoint, code_number]);
//         const reselect = await connection.query(sql4, [code_number]);

//         await connection.commit();
//         const result = {...select, ...reselect};
//         console.log(result);
//         return res.status(200).send(result);
//     } catch (error) {
//       console.log(err)
//       await connection.rollback() // 롤백
//       return res.status(500).json(err)
//     }finally {
//       connection.release();}
// });

        // app.get("/api/studentinfo", (req, res) => {
        //     const verifyedToken = verifyToken(req.header('Authorization'))
        //     console.log(verifyedToken)
        //         if (verifyedToken != null) {
        //         const email = verifyedToken.email
        //         const sql = `select student_number, student_name, code_number, point from users WHERE email = '${email}' `;
        //         connection.query(sql, (err, result) => {
        //             try {
        //                 const user = result[0]
        //                 return res.status(200).json({ 
        //                     message: "학생정보 조회에 성공했습니다",
        //                     number: user.student_number,
        //                     name: user.student_name,
        //                     code: user.code,
        //                     point: user.point
        //                 });
        //             } catch (err) {
        //                 return res.status(500).json({ error: "조회를 실패하였습니다" });
        //             }
        //         })
        //     }   
        // });


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
app.use("/api/studentinfo", stinfoRouter);
app.use("/api/adminlogin", adminloginRouter);

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

// app.post("/api/charge", (req, res) => {
//     const { plusPoint, code_number } = req.body;
//     console.log(plusPoint);
//     const sql = "update users set point = point + ? where code_number = ?";
//     connection.query(sql, [plusPoint, code_number], (err, result) => {
//         if (err) {
//         throw err;
//         }
//         console.log(result);
//         res.send("point save to database" + result);
//     });
// });

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