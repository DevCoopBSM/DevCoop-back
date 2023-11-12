const express = require("express");
const { ChargeLog, PayLog } = require("@models");
const { getInfoFromReqToken } = require("@token");
const router = express.Router();
router.use(express.json());

router.get("/", async (req, res) => {
  const { type } = req.query;
  reqInfo = await getInfoFromReqToken(req)
  code_number = reqInfo.code_number
  if (type != 0 & type != 1) {
    console.log("type is wrong");
    return res.status(400).send("Bad: log type is wrong");
  }

  try {
    let Model = type == 1 ? ChargeLog : PayLog; // 모델을 선택합니다.

    const logs = await Model.findAll({
      where: { code_number: code_number },
      order: [['date', 'DESC']],
      limit: 10,
      attributes: ['date', 'inner_point', 'type']
    });

    console.log(logs);
    return res.status(200).json(logs);
    
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
