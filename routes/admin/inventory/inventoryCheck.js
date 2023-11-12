const express = require("express");
const router = express.Router();
const InventoryService = require("@inventory");

router.get("/", async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    // 재고 변동사항을 조회합니다.
    const inventoryChanges = await InventoryService.getInventoryChanges(start_date, end_date);
    // const test = InventoryService.getInventoryByDate(end_date)
    // console.log(InventoryService.getInventoryByDate(test))
    if (inventoryChanges.length > 0) {
      // 재고 스냅샷을 생성합니다.
      // await InventoryService.createInventorySnapshot();
      // const test = await InventoryService.getInventoryByDate(end_date)
      // console.log(test)
      res.status(200).send(inventoryChanges);
    } else {
      res.status(204).json({ message: "해당 기간에 재고가 존재하지 않습니다." });
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
