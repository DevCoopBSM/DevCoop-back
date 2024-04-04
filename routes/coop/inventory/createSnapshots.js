const express = require("express");
const { body, validationResult } = require("express-validator");
const { Items, Inventory } = require("@models");
const InventoryService = require("@inventory");
const { getInfoFromReqToken } = require("@token");
const router = express.Router();

router.use(express.json());

router.post(
  "/",
  [
    body("barcode").notEmpty().withMessage("바코드 누락"),
    body("quantity").notEmpty().withMessage("수량 누락"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { barcode, quantity, reason } = req.body;
    const reqInfo = await getInfoFromReqToken(req);
    const writer_id = reqInfo.email;

    try {
      const item = await Items.findOne({ where: { barcode } });
      if (item) {
        await InventoryService.createSnapshotForItem(
          item.item_id,
          quantity,
          writer_id,
        );

        return res.status(200).json({
          success: "스냅샷 등록 완료",
          name: item.item_name,
          quantity: quantity,
        });
      } else {
        return res.status(400).json({
          failed: "해당 바코드 번호에 대한 상품이 존재하지 않습니다.",
        });
      }
    } catch (err) {
      console.error("Error", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

module.exports = router;
