const express = require("express");
const router = express.Router();
const InventoryService = require("@inventory");

router.get("/", async (req, res) => {
  try {
    const inventoryChanges = await InventoryService.getItemList();

    if (inventoryChanges.length > 0) {
      res.status(200).send(inventoryChanges);
    } else {
      res.status(204).json({ message: "아이템 목록이 없습니다." });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
