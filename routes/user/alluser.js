const express = require("express");
const { executeQuery } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  // const sql = "SELECT users.student_number, users.student_name, users.point, user_log.inner_point, user_log.type FROM users INNER JOIN user_log ON users.code_number = user_log.code_number order by user_log.date desc limit 10";
  const sql = `select code_number, student_name from users`;
  try {
    executeQuery(sql, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }
      console.log("good");
      return res.status(200).send(result);
    });
  } catch(err) {
    console.log(err)
  }

});

module.exports = router;
