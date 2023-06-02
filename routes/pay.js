const express = require('express')
const mysql = require('mysql');
const dbconfig = require('../config/db');
const router = express.Router();
const port = 6000;

const connection = mysql.createConnection(dbconfig);

router.post("/", (req, res) => {
    const { minusPoint, code_number } = req.body;
    const sql = "update users set point = point - ? where code_number = ? and point - ? >= 0";
    connection.query(sql, [minusPoint, code_number, minusPoint], (err, result) => {
        try {
            return res.status(200).json({
                message: "결제가 완료되었습니다"
            })
        } catch (err) {
            return res.status(400).json({
                error: "결제를 실패하였습니다"
            })
        }
    });
});

module.exports = router;