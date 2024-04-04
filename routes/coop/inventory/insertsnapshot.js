const express = require("express");
const { body, validationResult } = require("express-validator");
const { Items, Inventory } = require("@models");
const { getInfoFromReqToken } = require("@token");
const router = express.Router();

router.use(express.json());

router.get("/:barcode", async (req, res) => {
  const { barcode } = req.params;
  if (!barcode) {
    return res.status(400).json({ error: "바코드가 잘못되었습니다." });
  }
  try {
    const item = await Items.findOne({ where: { barcode } });
    if (item) {
      return res.status(200).json({
        success: "바코드 검증 성공",
        message: "바코드 인식 성공",
        name: item.item_name,
        item_id: item.item_id,
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

router.post(
  "/",
  [
    body("barcode").notEmpty().withMessage("바코드 누락"),
    body("quantity").notEmpty().withMessage("수량 누락"),
    body("reason").notEmpty().withMessage("사유 누락"),
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
        await Inventory.create({
          item_id: item.item_id,
          item_name: item.item_name,
          quantity,
          writer_id,
          reason,
          last_updated: new Date(), // Sequelize가 자동으로 날짜를 설정합니다.
        });

        return res.status(200).json({
          success: "재고 등록 완료",
          name: item.item_name,
        });
      } else {
        return res
          .status(400)
          .json({
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
