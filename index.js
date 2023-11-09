const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
const corsOptions = {
  origin: "*", // 모든 도메인 요청 허용
  methods: "GET, POST, PUT, DELETE, OPTIONS", // 허용되는 HTTP 메서드
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept", // 허용되는 헤더
};

// CORS 미들웨어를 사용합니다.
app.use(cors(corsOptions));

const port = 6002;

const signupRouter = require("./routes/auth/signup");
const loginRouter = require("./routes/auth/login");
const logoutRouter = require("./routes/auth/logout");

const meRouter = require("./routes/user/me");
const stinfoRouter = require("./routes/user/studentinfo");
const barcodeRouter = require("./routes/user/barcode");

const chargeRouter = require("./routes/user/charge");
const payRouter = require("./routes/user/pay");

// const chargeCompleteRouter = require("./routes/user/chagecomplete");
// const payCompleteRouter = require("./routes/user/paycomplete");

const adminloginRouter = require("./routes/auth/adminlogin");

const adminChargeUserLogRouter = require("./routes/admin/adminChargeUserLog");
const adminPayUserLogRouter = require("./routes/admin/adminPayUserLog");

const chargeUserLogRouter = require("./routes/user/chargeuserlog");
const chargeLogRouter = require("./routes/user/chargelog");
const payLogRouter = require("./routes/user/paylog");
const payUserLogRouter = require("./routes/user/payuserlog");

const allUserRouter = require("./routes/user/alluser");
const allChargeRouter = require("./routes/user/allcharge");

const pwChangeRouter = require("./routes/auth/pwchange");

//크롤링 부분
const receiptCrawlingRouter = require("./routes/crawl/receipt");
const itemsCrawlingRouter = require("./routes/crawl/items");

//재고 관련
const addItemBarcodeRouter = require("./routes/admin/addItemBarcode");
const inventoryCheckRouter = require("./routes/admin/inventoryCheck");
const inventoryExcelRouter = require("./routes/admin/excel");
const removedItemBarcode = require("./routes/admin/removeItemBarcode");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/me", meRouter);
app.use("/api/studentinfo", stinfoRouter);

app.use("/api/chargeuserlog", chargeUserLogRouter);
app.use("/api/payuserlog", payUserLogRouter);

// 어드민 기능은 매점 내에서만 접근 가능, 다른곳에서 접근시 에러 발생시켜야함
app.use("/api/admin/login", adminloginRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/admin/charge", chargeRouter);
app.use("/api/admin/pay", payRouter);
app.use("/api/admin/allcharge", allChargeRouter);
app.use("/api/admin/barcode", barcodeRouter);

app.use("/api/admin/chargeuserlog", adminChargeUserLogRouter);
app.use("/api/admin/payuserlog", adminPayUserLogRouter);
app.use("/api/admin/chargelog", chargeLogRouter);
app.use("/api/admin/paylog", payLogRouter);

app.use("/api/admin/alluser", allUserRouter);
app.use("/api/admin/pwchange", pwChangeRouter);

app.use("/api/admin/crawl/receipt", receiptCrawlingRouter);
app.use("/api/admin/crawl/items", itemsCrawlingRouter);
app.use("/api/admin/addItemBarcode", addItemBarcodeRouter);
app.use("/api/admin/inventoryCheck", inventoryCheckRouter);
app.use("/api/admin/excelDownload", inventoryExcelRouter);
app.use("/api/admin/removedItemBarcode", removedItemBarcode);

// CORS 하용 설정하기. << 이거 위에 cors() 되어있지 않음?
// app.use((req, res, next) => {
//   res.setHeader("Content-Type", "application/json");
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.listen(port, (req, res) => {
  console.log(`WEB Server is running on port ${port}`);
});
