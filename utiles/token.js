const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();
const mysql = require('mysql2');
const dbconfig = require('../config/db');
const connection = mysql.createConnection(dbconfig);



function generateRandomString(length) {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('base64').slice(0, length);
}; // secret key 랜덤 문자열 생성


const genToken = async( email, password , time) => {
    const Header = {
        type: "JWT",
        issur: "AriSori"
    };

    const encodedHeader = Buffer.from(JSON.stringify(Header)).toString('base64');

    const salt = await bcrypt.genSalt(Number(8));
    const hashedPassword = await bcrypt.hash(String(password), salt);

    const Payload = {
        email: email,
        password: hashedPassword
    }

    const encodedPayload = Buffer.from(JSON.stringify(Payload)).toString('base64');

    const expiresIn = time; // 토큰 유지시간 설정

    const signature = crypto
        .createHmac("sha256", process.env.SECRET_KEY, { expiresIn })
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64")
        .replace(/=/g, "");


    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    return token;

};




exports.genToken = genToken;
