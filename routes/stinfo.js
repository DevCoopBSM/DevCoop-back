const express = require('express');
const router = express.Router();
const {checkTokens} = require('../middlewares/users')
const {verifyToken} = require('../utils/token')
const {connection} = require('../utils/query')

router.use(express.json());
router.use((req, res, next)=> checkTokens(req, res, next));

router.get('/', async (req, res) => {
    console.log("hello");
    const verifyedToken = verifyToken(req.header('access'));
    if(verifyedToken==null) {return res.status(500).json({ error: "조회를 실패하였습니다" });}
    console.log(verifyedToken);
    const email = verifyedToken.email;
    console.log(email);
    const sql = `select student_number, student_name, code_number, point from users WHERE email = '${email}' `;
    connection.query(sql, (err, result) => {
        try {
            const user = result[0]
            return res.status(200).json({ 
                message: "학생정보 조회에 성공했습니다",
                number: user.student_number,
                name: user.student_name,
                code: user.code,
                point: user.point
                });
        } catch (err) {
            return res.status(500).json({ error: "조회를 실패하였습니다" });
        }
    })
})


module.exports = router;