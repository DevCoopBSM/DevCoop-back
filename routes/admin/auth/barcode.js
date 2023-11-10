const express = require("express");
const { executeQuery } = require("@query");
const router = express.Router();
router.use(express.json());


router.post("/", (req, res) => {
  // console.log(req.body);
  const { code_number } = req.body;
  const sql = "select point, student_name from users WHERE code_number = ?";
  executeQuery(sql, [code_number], (err, [result]) => {
    try {
      console.log(result);
      return res.status(200).json({
        message: "find",
        point: result.point,
        studentname: result.student_name,
      });
    } catch (err) {
      return res.status(400).json({
        message: "No match",
        error: err,
      });
    }
  });
});

module.exports = router;
