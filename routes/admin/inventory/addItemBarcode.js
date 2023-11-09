const { executeQueryPromise } = require("../../../utils/query");
const express = require("express");
const { checkAdminTokens } = require("../../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);
const selecItemQuary = "select item_name, item_id from items where barcode = ?";
const insertInventoryQuary =
  "insert into inventory(item_id, item_name, quantity, last_updated) values(?, ?, ?, CURRENT_TIMESTAMP)";

router.get("/:barcode", async (req, res) => {
  const { barcode } = req.params;
  if (!barcode) {
    return res.status(400).json({ error: "바코드가 잘못되었습니다." });
  }
  try {
    const result = await executeQueryPromise(selecItemQuary, [barcode]);
    if (result.length > 0) {
      const { item_name, item_id } = result[0];
      return res.status(200).json({
        success: "바코드 검증 성공",
        message: "바코드 인식 성공",
        name: item_name,
        item_id: item_id,
        item_barcode: barcode,
      });
    } else {
      return res.status(400).json({
        message: "바코드가 존재하지 않습니다.",
      });
    }
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json({ error: "서버 오류" });
  }
});
router.post("/", async (req, res) => {
  const { barcode, quantity } = req.body;
  if (!barcode || !quantity) {
    console.log(barcode, quantity);
    return res
      .status(400)
      .json({ error: "바코드 또는 수량입력이 잘못됐습니다." });
  }
  try {
    const result = await executeQueryPromise(selecItemQuary, [barcode]);
    if (result.length > 0) {
      const { item_name, item_id } = result[0];
      await executeQueryPromise(insertInventoryQuary, [
        item_id,
        item_name,
        quantity,
      ]);
      console.log(item_name);
      return res.status(200).json({
        success: "재고 등록 완료",
        name: item_name,
      });
    } else {
      return res.status(400).json({ failed: "존재하지 않습니다." });
    }
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
