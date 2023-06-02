const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const dbconfig = require('./config/db')
const cors = require("cors");

const port = 6000;

const connection = mysql.createConnection(dbconfig);

const payRouter = require('./routes/pay');
const chargeRouter = require('./routes/charge');
const checkRouter = require('./routes/check');

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

connection.connect((err) => {
    try {
        console.log("MySql connect...");
    }catch(err){
        throw err;
    } 
})

app.use('/api/charge', chargeRouter);
app.use('/api/check', checkRouter);
app.use('/api/pay', payRouter);

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

app.listen(port, (req, res) => {
    console.log(`WEB Server is running on port ${port}`)
});