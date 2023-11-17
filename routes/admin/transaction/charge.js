const express = require('express');
const { Users, sequelize, ChargeLog } = require('@models');
const { getInfoFromReqToken } = require('@token');
const router = express.Router();

router.use(express.json());

router.post('/', async (req, res) => {
  const { plusPoint:OriplusPoint, code_number } = req.body;
  const reqInfo = await getInfoFromReqToken(req);
  const charger_id = reqInfo.email;
  const plusPoint = parseInt(OriplusPoint)

  if (plusPoint <= 0 || !plusPoint) {
    console.log(plusPoint);
    return res.status(400).json({ error: '충전값이 0 이하입니다.' });
  }
  
  // 트랜잭션 시작
  const t = await sequelize.transaction();
  
  try {
    const user = await Users.findOne({
      where: {
        code_number: code_number,
      },
      transaction: t,
    });
    
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: '해당 사용자를 찾을 수 없습니다.' });
    }
    
    const initialResponse = {
      student_number: user.student_number,
      oldPoint: user.point,
      plusPoint: plusPoint,
      student_name: user.student_name,
    };
    
    // ChargeLog 모델을 사용하여 데이터베이스에 로그를 추가
    await ChargeLog.create({
      code_number: code_number,
      date: new Date(),
      type: '1',
      inner_point: plusPoint,
      point: user.point, // 데이터 유형이 정수로 변경됨
      charger_id: charger_id,
      verify_key: 'test',
      student_name: user.student_name,
    }, {
      transaction: t,
    });
    
    user.point += plusPoint;
    console.log(user.point); // 로그 출력
    await user.save({ transaction: t });
    
    await t.commit();
    
    const finalResponse = {
      newPoint: user.point,
      message: 'success',
    };
    
    const response = { ...initialResponse, ...finalResponse };
    console.log(response);
    return res.status(200).json(response);
    
  } catch (err) {
    console.error('Error:', err);
    await t.rollback();
    return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
  }
});

module.exports = router;
