const express = require('express')
const mysql = require('mysql');
const dbconfig = require('../config/db');
const router = express.Router();
const port = 6000;

const connection = mysql.createConnection(dbconfig);

router.post("/", (req, res) => {
    const { plusPoint, code_number } = req.body;
    const sql = "update users set point = point + ? where code_number = ?";
    connection.query(sql, [plusPoint, code_number], (err, result) => {
        try {
            return res.status(200).json({
                message: "충전을 완료하였습니다"
            })
        }catch(err){
            return res.status(500).json({
                error: "충전을 실패하였습니다"
            })
        } 
    
    });
});

module.exports = router;