const express = require("express");
// const passport = require('passport');
const { connection, pool } = require("./utils/query");
// const router = express.Router();
const app = express();
const cors = require("cors");
// const {verifyToken} = require('./utils/token')
app.use(express.json());
const port = 6002;
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const meRouter = require("./routes/me");
const stinfoRouter = require("./routes/stinfo");
const adminloginRouter = require("./routes/adminlogin");
const barcodeRouter = require("./routes/barcode");
const chargeRouter = require("./routes/charge");
const payRouter = require("./routes/pay");
const useuserlogRouter = require("./routes/useuserlog");
const chargeCompleteRouter = require("./routes/chagecomplete");
const payCompleteRouter = require("./routes/paycomplete");
const adminUseUserLogRouter = require("./routes/adminUseUserLog");
const adminChargeUserLogRouter = require("./routes/adminChargeUserLog");
const chargeUserLogRouter = require("./routes/chargeuserlog");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

connection.connect((err) => {
  try {
    console.log("Mysql connect...");
  } catch (err) {
    throw err;
  }
});

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

app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/me", meRouter);
app.use("/api/studentinfo", stinfoRouter);
app.use("/api/adminlogin", adminloginRouter);
app.use("/api/charge", chargeRouter);
app.use("/api/pay", payRouter);
app.use("/api/barcode", barcodeRouter);
app.use("/api/useuserlog", useuserlogRouter);
app.use("/api/chargecomplete", chargeCompleteRouter);
app.use("/api/paycomplete", payCompleteRouter);
app.use("/api/adminuseuserlog", adminUseUserLogRouter);
app.use("/api/adminchargeuserlog", adminChargeUserLogRouter);
app.use("/api/chargeuserlog", chargeUserLogRouter);

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

app.listen(port, (req, res) => {
  console.log(`WEB Server is running on port ${port}`);
});
