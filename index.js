const express = require("express");
require('module-alias/register');
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
app.use(cors(corsOptions));


app.use(express.urlencoded({ extended: true }));



const port = 6002;

const adminloginRouter = require("./routes/auth/adminlogin");
const signupRouter = require("./routes/auth/signup");
const loginRouter = require("./routes/auth/login");
const logoutRouter = require("./routes/auth/logout");

const adminRouter = require("./routes/admin/adminRouter")


const meRouter = require("./routes/user/me");
const userInfoRouter = require("./routes/user/userInfo");
const userLogRouter = require("./routes/user/transaction/userLog");

const receiptCrawlingRouter = require("./routes/crawl/receipt");
const itemsCrawlingRouter = require("./routes/crawl/items");




app.use("/api/crawl/receipt", receiptCrawlingRouter);
app.use("/api/crawl/items", itemsCrawlingRouter);


app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);
app.use("/api/me", meRouter);
app.use("/api/userinfo", userInfoRouter);

app.use("/api/userlog", userLogRouter);
// app.use("/api/chargeuserlog", chargeUserLogRouter);
// app.use("/api/payuserlog", payUserLogRouter);

// 어드민 기능은 매점 내에서만 접근 가능, 다른곳에서 접근시 에러 발생시켜야함
app.use("/api/admin/login", adminloginRouter);
app.use("/api/admin", adminRouter);



app.listen(port, (req, res) => {
  console.log(`WEB Server is running on port ${port}`);
});
