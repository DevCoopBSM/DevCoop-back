const express = require('express')
const mysql = require('mysql');
const dbconfig = require('../config/db');
const router = express.Router();
const port = 6000;

const connection = mysql.createConnection(dbconfig);


router.get("/", (req, res) => {
    const { email, password } = req.body;
    const sql =
        "select student_name, point from users WHERE email = ? and password = ?";
    connection.query(sql, [email, password], (err, result) => {
        try {
            return res.status(200).json({
                message: "조회를 성공하였습니다"
            })
        }catch(err){
            return res.status(500).json({
                message: "조회를 실패하였습니다"
            })
        }
    });
});

module.exports = router