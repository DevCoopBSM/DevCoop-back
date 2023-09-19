const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // 쿠키에서 토큰 제거
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('isLoggedIn');  // <-- 이 부분을 res.json() 호출 전으로 옮겼습니다.

        return res.status(200).json({
            message: '로그아웃 되었습니다.',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: '내부 서버 오류가 발생하였습니다' });
    }
});

module.exports = router;
