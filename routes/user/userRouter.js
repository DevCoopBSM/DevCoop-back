const express = require("express");
const router = express.Router();


const userInfoRouter = require("./userInfo");
const userLogRouter = require("./transaction/userLog");

const { checkTokens } = require("@token");


router.use(checkTokens);


router.use("/userinfo", userInfoRouter);
router.use("/userlog", userLogRouter);


module.exports = router;
