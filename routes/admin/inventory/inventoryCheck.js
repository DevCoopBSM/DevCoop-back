const { executeQueryPromise } = require("../../../utils/query");
const express = require("express");
const { checkAdminTokens } = require("../../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);
const selectItemQuery =
  "SELECT item_id , item_name, sum(quantity)as quantity,max(last_updated) as last_updated FROM inventory group by item_id, item_name order by last_updated desc";
const selectDateItemQuery =
  "SELECT item_id , item_name, sum(quantity)as quantity, max(last_updated) as last_updated FROM inventory where DATE_FORMAT(last_updated, '%Y-%m-%d') BETWEEN ? and ? group by item_id, item_name order by last_updated desc ";

router.get("/", async (req, res) => {
  const { start_date, end_date } = req.query;
  console.log(start_date, end_date);
  try {
    if (start_date && end_date) {
      console.log(start_date, end_date);
      const date_result = await executeQueryPromise(selectDateItemQuery, [
        start_date,
        end_date,
      ]);
      if (date_result.length > 0) {
        return res.status(200).send(date_result);
      } else {
        return res
          .status(200)
          .json({ check: "해당기간에 재고가 존재하지 않습니다." });
      }
    } else {
      const result = await executeQueryPromise(selectItemQuery);
      console.log(result);
      return res.status(200).send(result);
    }
  } catch (err) {
    console.error("Error", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
