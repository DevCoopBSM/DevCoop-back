const express = require("express");
const router = express.Router();
const InventoryService = require("@inventory");

router.get("/", async (req, res) => {
  const { end_date } = req.query;

  try {
    // 재고 변동사항을 조회합니다.
    const inventoryChanges =
      await InventoryService.getInventoryByDate(end_date);

    if (inventoryChanges.length > 0) {
      console.log(inventoryChanges);
      res.status(200).send(inventoryChanges);
    } else {
      res
        .status(204)
        .json({ message: "해당 기간에 재고가 존재하지 않습니다." });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
