const express = require("express");
const router = express.Router();
const { checkTokens } = require("@token");

router.use(express.json());
router.post("/", async (req, res) => {
  const state = checkTokens(req, res);
  console.log([req.header("accessToken"), req.header("refrashToken")]);
  return res.status(200).json();

});
module.exports = router;
