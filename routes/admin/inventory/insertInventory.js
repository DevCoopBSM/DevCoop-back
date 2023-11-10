const { executeQueryPromise } = require("../../../utils/query");
const express = require("express");
const { getInfoFromReqToken } = require("../../../middlewares/users");
const router = express.Router();

router.use(express.json());

const selecItemQuary = "select item_name, item_id from items where barcode = ?";
const insertInventoryQuary =
  "insert into inventory(item_id, item_name, quantity, last_updated, writer_id, reason) values(?, ?, ?, CURRENT_TIMESTAMP, ?, ?)";

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
  const { barcode, quantity, reason } = req.body;
  const reqInfo = await getInfoFromReqToken(req);
  const writer_id = reqInfo.email;

  // 유효성 검증은 백엔드 몫, 조금더 좋은 유효성검증 방안을 찾아보자..
  if (!barcode) {
    console.log("empty barcode");
    return res
      .status(400)
      .json({ error: "바코드 누락" });
  }
  if (!quantity) {
    console.log("empty quantity");
    return res
      .status(400)
      .json({ error: "수량 누락" });
  }
  if (!reason) {
    console.log("empty reason");
    return res
      .status(400)
      .json({ error: "사유 누락" });
  }

  try {
    const result = await executeQueryPromise(selecItemQuary, [barcode]);
    if (result.length > 0) {
      const { item_name, item_id } = result[0];
      await executeQueryPromise(insertInventoryQuary, [
        item_id,
        item_name,
        quantity,
        writer_id,
        reason
      ]);

      console.log(item_name);
      return res.status(200).json({
        success: "재고 등록 완료",
        name: item_name,
      });
    } else {
      return res.status(400).json({ failed: "해당 바코드 번호에 대한 상품이 존재하지 않습니다." });
    }
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
