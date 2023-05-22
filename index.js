const express = require('express') // NodeJS 웹 프레임워크
const app = express()
const mysql = require('mysql2')
const path = require('path')
const db = require('./config/db')
const cors = require("cors");

const port = 9000;

const connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
})

app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(express.json())

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('MySQL connected...')
    }
})

app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

app.listen(port, (req, res) => {
    console.log(`WEB Server is running on port ${port}`)
});