const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/check', (req, res) => {
    res.render('check')
})

router.get('/charge', (req, res) => {
    res.render('charge')
})

router.get('/pay', (req, res) => {
    res.render('pay')
})
module.exports = router;