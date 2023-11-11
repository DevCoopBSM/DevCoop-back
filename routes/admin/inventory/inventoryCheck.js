const { sequelize, Inventory } = require("@models");

const express = require("express");
const router = express.Router();
const { Op } = require('sequelize');
router.get("/", async (req, res) => {
  const { start_date, end_date } = req.query;

  try {
    if (start_date && end_date) {
      console.log(start_date, end_date)
      const date_result = await Inventory.findAll({
        attributes: [
          'item_id',
          'item_name',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity'],
          [sequelize.fn('MAX', sequelize.col('last_updated')), 'last_updated']
        ],
        where: sequelize.where(sequelize.fn('DATE_FORMAT', sequelize.col('last_updated'), '%Y-%m-%d'), {
          [Op.between]: [start_date, end_date]
        }),
        group: ['item_id', 'item_name'],
        order: [['last_updated', 'DESC']]
      });

      if (date_result.length > 0) {
        res.status(200).send(date_result);
      } else {
        res.status(204).json({ message: "해당 기간에 재고가 존재하지 않습니다." });
      }
    } else {
      const result = await Inventory.findAll({
        attributes: [
          'item_id',
          'item_name',
          [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
          [sequelize.fn('max', sequelize.col('last_updated')), 'last_updated']
        ],
        group: ['item_id', 'item_name'],
        order: [['last_updated', 'DESC']]
      });

      res.status(200).send(result);
    }
  } catch (err) {
    console.error("Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
