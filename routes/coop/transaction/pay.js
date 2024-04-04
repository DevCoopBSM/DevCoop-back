const express = require('express');
const { Users, sequelize, PayLog } = require('@models');
const { getInfoFromReqToken } = require('@token');
const router = express.Router();

router.use(express.json());

router.post('/', async (req, res) => {
  const { code_number, minusPoint: OriminusPoint } = req.body;
  const reqInfo = await getInfoFromReqToken(req);
  const charger_id = reqInfo.email;
  const minusPoint = parseInt(OriminusPoint)
  if (minusPoint <= 0 || !minusPoint) {
    console.log(minusPoint);
    return res.status(400).json({ error: '결제하는 값이 0 이하입니다.' });
  }
  
  // 트랜잭션 시작
  const t = await sequelize.transaction();
  
  try {
    const user = await Users.findOne({
      where: {
        code_number: code_number,
      },
      transaction: t, // 트랜잭션 사용
    });
    
    if (!user) {
      await t.rollback(); // 롤백
      return res.status(404).json({ error: '해당 사용자를 찾을 수 없습니다.' });
    }
    
    const initialResponse = {
      student_number: user.student_number,
      oldPoint: user.point,
      minusPoint: minusPoint,
      student_name: user.student_name,
    };
    
    if (user.point - minusPoint < 0) {
      await t.rollback(); // 롤백
      return res.status(400).json({ message: '잘못된 요청입니다. 잔액 초과' });
    }
    
    // PayLog 모델을 사용하여 데이터베이스에 로그를 추가
    await PayLog.create({
      code_number: code_number,
      date: new Date(),
      type: '0', // 텍스트 형식으로 타입을 설정
      inner_point: minusPoint,
      point: user.point, // 데이터 유형이 정수로 변경됨
      charger_id: charger_id,
      verify_key: 'test', // 기본값으로 설정
      student_name: user.student_name,
    }, {
      transaction: t, // 트랜잭션 사용
    });
    
    user.point -= minusPoint;
    console.log(user.point); // 로그 출력
    await user.save({ transaction: t }); // 트랜잭션 사용
    
    await t.commit(); // 커밋
    
    const finalResponse = {
      newPoint: user.point,
      message: 'success',
    };
    
    const response = { ...initialResponse, ...finalResponse };
    console.log(response); // 로그 출력
    return res.status(200).json(response);
    
  } catch (err) {
    console.error('Error:', err);
    await t.rollback(); // 롤백
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
