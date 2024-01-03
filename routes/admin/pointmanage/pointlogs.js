const express = require("express");
const { Op, Sequelize } = require("sequelize");
const { ChargeLog, PayLog, Users } = require("@models");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const { start_date, end_date, type } = req.query;
  let LogType = "charge";
  let Log = ChargeLog;
  if (type == 1) {
    Log = PayLog;
    LogType = "pay";
  }
  Log.findAll({
    where: {
      date: {
        [Op.between]: [start_date, end_date],
      },
    },
    include: [
      {
        model: Users,
        attributes: ["student_name"],
      },
    ],
  })
    .then((logs) => {
      return res.status(200).send(logs);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "내부 서버 에러가 발생하였습니다",
      });
    });
});

module.exports = router;
