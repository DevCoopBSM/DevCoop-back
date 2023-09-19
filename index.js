const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());


const port = 6002;
const signupRouter = require("./routes/auth/signup");
const loginRouter = require("./routes/auth/login");
const meRouter = require("./routes/user/me");
const stinfoRouter = require("./routes/user/stinfo");
const adminloginRouter = require("./routes/auth/adminlogin");
const barcodeRouter = require("./routes/user/barcode");

const chargeRouter = require("./routes/user/charge");
const payRouter = require("./routes/user/pay");

// const chargeCompleteRouter = require("./routes/user/chagecomplete");
// const payCompleteRouter = require("./routes/user/paycomplete");

const adminChargeUserLogRouter = require("./routes/admin/adminChargeUserLog");
const adminPayUserLogRouter = require("./routes/admin/adminPayUserLog");

const chargeUserLogRouter = require("./routes/user/chargeuserlog");
const chargeLogRouter = require("./routes/user/chargelog");
const payLogRouter = require("./routes/user/paylog");
const payUserLogRouter = require("./routes/user/payuserlog");

const allUserRouter = require("./routes/user/alluser");
const allChargeRouter = require("./routes/user/allcharge");

const pwChangeRouter = require("./routes/auth/pwchange");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// SQL 부분 작성 시작

// 프로그램 종료시 연결 닫기


app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/me", meRouter);
app.use("/api/studentinfo", stinfoRouter);

app.use("/api/chargeuserlog", chargeUserLogRouter);
app.use("/api/payuserlog", payUserLogRouter);


app.use("/api/admin/login", adminloginRouter);

app.use("/api/admin/charge", chargeRouter);
app.use("/api/admin/pay", payRouter);
app.use("/api/admin/allcharge", allChargeRouter);


app.use("/api/admin/barcode", barcodeRouter);
// app.use("/api/admin/chargecomplete", chargeCompleteRouter);
// app.use("/api/admin/paycomplete", payCompleteRouter);


app.use("/api/admin/chargeuserlog", adminChargeUserLogRouter);
app.use("/api/admin/payuserlog", adminPayUserLogRouter);  
app.use("/api/admin/chargelog", chargeLogRouter);
app.use("/api/admin/paylog", payLogRouter);

app.use("/api/admin/alluser", allUserRouter);
app.use("/api/admin/pwchange", pwChangeRouter);

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
