const express = require("express");
const { executeQueryPromise } = require("../../utils/query");
const router = express.Router();
router.use(express.json());

router.get("/", async(req, res) => {
  const sql = `SELECT code_number, student_name FROM users`;
  try {
    const result = await executeQueryPromise(sql);
    console.log("good");
    return res.status(200).send(result);
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;