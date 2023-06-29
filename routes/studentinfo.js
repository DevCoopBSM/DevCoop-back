const express = require("express");
const {connection} = require("../utils/query")
const router = express.Router();
router.use(express.json());

router.post("/", (req, res) => {
    const {code_number} = req.body;
    const sql ="select point, student_name from users WHERE code_number = ?";
    connection.query(sql, [code_number] , (err, [result]) => {
        try {
            return res.status(200).json({
                message: "success",
                nowPoint: result.point,
                stName : result.student_name
            });
        } catch (err) {
            return res.status(400).json({ 
              message: "success fail",
              error: err
             });
        }
    });
});

module.exports = router;
