const express = require("express");
const { executeQueryPromise } = require("@query");
const router = express.Router();
router.use(express.json());

router.get("/", async (req, res) => {
  const sql =
    "SELECT code_number, student_name, is_coop, email, point, is_admin FROM users";
  try {
    const result = await executeQueryPromise(sql);
    return res.status(200).send(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
