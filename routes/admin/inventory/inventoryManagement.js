const { executeQueryPromise } = require("@query");
const express = require("express");
const router = express.Router();

router.use(express.json());


router.post("/", async (req, res) => {
  const selectInventory =
    "select item_id, sum(quantity) from inventory group by item_id";
  const selectReceipt =
    "SELECT item_id, sum(sale_qty) from receipt group by item_id";

  try {
    const result = await executeQueryPromise(selecItemQuary);
    console.log(result);
    return res.status(200).send(result);
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
