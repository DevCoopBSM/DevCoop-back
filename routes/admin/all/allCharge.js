const express = require("express");
const { Users, ChargeLog, sequelize } = require("@models"); // Sequelize 모델을 가져옵니다.
const { getInfoFromReqToken } = require("@token");
const router = express.Router();

router.use(express.json());

router.post("/", async (req, res) => {
  const { list_code_number, plusPoint } = req.body;
  const reqInfo = await getInfoFromReqToken(req);
  const charger_id = reqInfo.email;
  let transaction;

  try {
    // Sequelize 트랜잭션 시작
    transaction = await sequelize.transaction();

    // 유저 상세정보 조회
    const userDetails = await Users.findAll({
      where: {
        code_number: list_code_number,
      },
      transaction: transaction,
    });

    if (userDetails.length === 0) {
      await transaction.rollback();
      return res.status(401).json({ error: "해당 결과 없음" });
    }

    for (const user of userDetails) {
      // ChargeLog에 기록
      await ChargeLog.create(
        {
          code_number: user.code_number,
          date: new Date(),
          type: 1,
          inner_point: plusPoint,
          point: user.point,
          charger_id: charger_id,
          verify_key: "test",
          student_name: user.student_name,
        },
        { transaction: transaction },
      );

      // 유저 포인트 업데이트
      user.point += plusPoint;
      await user.save({ transaction: transaction });
    }

    // 트랜잭션 커밋
    await transaction.commit();

    console.log("Insertion complete");
    return res.status(200).send("ok");
  } catch (err) {
    // 에러 발생 시 트랜잭션 롤백
    console.error("Error in batch insert:", err);
    if (transaction) {
      await transaction.rollback();
    }
    return res.status(500).json({ error: "Error in batch insert" });
  }
});

module.exports = router;
