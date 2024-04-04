const express = require("express");
require("module-alias/register");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
const corsOptions = {
  origin: [
    "http://10.10.0.11",
    "http://10.129.57.12",
    "http://localhost:7000",
    "http://10.129.49.80:7000",
  ], // 외부, 내부 도메인
  methods: "GET, POST, PUT, DELETE, OPTIONS", // 허용되는 HTTP 메서드
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept", // 허용되는 헤더
  credentials: true, // 요청에 인증 정보를 허용,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

const port = 6002;

//crawl 부분
const receiptCrawlingRouter = require("./routes/crawl/receipt");
const itemsCrawlingRouter = require("./routes/crawl/items");

//auth 부분
const adminloginRouter = require("./routes/auth/adminlogin");
const signupRouter = require("./routes/auth/signup");
const loginRouter = require("./routes/auth/login");
const logoutRouter = require("./routes/auth/logout");
//admin 부분
const adminRouter = require("./routes/admin/adminRouter");
//user 부분
const userRouter = require("./routes/user/userRouter");

app.use("/api/crawl/receipt", receiptCrawlingRouter);
app.use("/api/crawl/items", itemsCrawlingRouter);

app.use("/api/signup", signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/logout", logoutRouter);

// 어드민 기능은 매점 내에서만 접근 가능, 다른곳에서 접근시 에러 발생시켜야함
app.use("/api/admin/login", adminloginRouter);
app.use("/api/admin", adminRouter);

app.use("/api/", userRouter);

app.listen(port, (req, res) => {
  console.log(`WEB Server is running on port ${port}`);
});
