const express = require("express");
// const passport = require('passport');
const { connection, pool } = require("./utils/query");
// const router = express.Router();
const app = express();
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
// const {verifyToken} = require('./utils/token')
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
const useuserlogRouter = require("./routes/user/useuserlog");
const chargeCompleteRouter = require("./routes/user/chagecomplete");
const payCompleteRouter = require("./routes/user/paycomplete");
const adminUseUserLogRouter = require("./routes/admin/adminUseUserLog");
const adminChargeUserLogRouter = require("./routes/admin/adminChargeUserLog");
const chargeUserLogRouter = require("./routes/user/chargeuserlog");
const chargeLogRouter = require("./routes/user/chargelog");
const payLogRouter = require("./routes/user/paylog");
const allUserRouter = require("./routes/user/alluser");
const allChargeRouter = require("./routes/user/allcharge");

connection.connect((err) => {
  try {
    console.log("Mysql connect...");
  } catch (err) {
    throw err;
  }
});

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
app.use("/api/chargelog", chargeLogRouter);
app.use("/api/paylog", payLogRouter);
app.use("/api/alluser", allUserRouter);
app.use("/api/allcharge", allChargeRouter);

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
  console.log(`WEB Server is running on port ${port}`);
});
