const express = require("express");
const router = express.Router();


const userInfoRouter = require("./userInfo");
const userLogRouter = require("./transaction/userLog");

const pwChange = require("./pwChange");

const { checkTokens } = require("@token");


router.use(checkTokens);


router.use("/userinfo", userInfoRouter);
router.use("/userlog", userLogRouter);

router.use("/pwChange", pwChange);


module.exports = router;