const express = require("express");
const { connection } = require("../utils/query")
const router = express.Router();
router.use(express.json());

router.get('/', (req, res) => {
    const {id} = req.query
    console.log("get success")
    const sql = `select inner_point, point, point+inner_point as total from user_log where code_number = ${id} order by date desc limit 1`;
    connection.query(sql,  (err, result) => {
        if (err) throw err;
        console.log("check");
        const value1 = result[Object.keys(result)[0]];
        const new_inner_point = value1.inner_point;
        const new_point = value1.point;
        const new_total = value1.total;
        if(result && result.length > 0) {
            console.log(value1);
            return res.status(200).json({
                message: "충전완료",
                inner_point: new_inner_point,
                point: new_point,
                total: new_total
            })
        } else {
            return res.status(500).json({
                message: "내부 서버 에러가 발생하였습니다"
            })
        }
    })
})

module.exports = router;