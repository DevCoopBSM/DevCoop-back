const {verify, sign} = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const {executeQuery, executeQueryPromise} = require('@query')
const crypto = require("crypto");
const { Users } = require("@models");



const verifyToken = (token) => {
    try {
        return verify(token, process.env.SECRET_KEY);
    } catch (err) {
        /**
         * 다음과 같은 형태로 특정 에러에 대해서 핸들링해줄 수 있다. 
         if (err.name === 'TokenExpiredError') {
            return null
         }
         *
         */
        return null;
    }
}


const genToken = async (email, name, expiretime) => {
    console.log("genToken!");
    const user = await Users.findOne({ where: { email: email }})
    code_number = user.code_number
    console.log(code_number)
    const Payload = {
        email: email,
        name: name,
        code_number: code_number,
    }
    return sign(Payload, process.env.SECRET_KEY, { expiresIn: expiretime });
};

const updateRefToken = async (email, token) => {
    try {
        await Users.update({ ref_token: token }, { where: { email: email } });
        console.log("Refresh token updated");
    } catch (error) {
        console.error("Error updating refresh token:", error);
        throw error;
    }
};

// 아래 코드는 토큰에서 payload부분 해독하여 이메일 등을 추출하려고 달아둠
const getPayload = (token) => {
    const payload = token.split('.')[1];
    return (JSON.parse(Buffer.from(payload, 'base64').toString('utf8')));
};


const updateToken = async (tokentype, email, token) => {
    try {
        const query = "UPDATE users SET ? = ? WHERE email = ?";
        await executeQueryPromise(query, [tokentype, token, email]);
    } catch (error) {
        console.error("Error updating token:", error);
    }
};

function getTokens(req) {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;
    return({accessToken: accessToken, refreshToken: refreshToken})
}


const handleExpiredTokens = async (req, res) => {
    const accessToken = getTokens(req).accessToken;
    const refreshToken = getTokens(req).refreshToken;
    console.log('Received refreshToken:', refreshToken); // 추가된 로깅
    try {
        const user = await Users.findOne({ where: { ref_token: refreshToken } });
        if (!user) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }

        if (!verifyToken(accessToken)) {
            const newAccessToken = await genToken(refreshToken.email, refreshToken.student_name, "1h");
            res.cookie('accessToken', newAccessToken, { httpOnly: true });
            return res.status(401).send({
                message : "accToken is renewed",
            });
        }

        if (!verifyToken(refreshToken)) {
            const newRefreshToken = await genToken(accessToken.email, accessToken.student_name, "14d");
            await updateToken("ref_token", accessToken.email, newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
            return res.status(401).send({
                message : "refToken is renewed",
            });
        }
        // 위의 조건 모두 실패하면 로그아웃 진행
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('isLoggedIn');
        res.clearCookie('isAdminLoggedIn');
        return res.status(401).send({
            message : "Renewing Token is fail, logout",
        });
    } catch (error) {
        console.error("Error in handleExpiredTokens:", error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};



async function checkTokens(req, res, next) {
    const accessToken = getTokens(req).accessToken;
    const refreshToken = getTokens(req).refreshToken;
    if (!verifyToken(accessToken) || !verifyToken(refreshToken)) {
        return handleExpiredTokens(req, res);
    }
    next();
}


const checkAdminTokens = async (req, res, next) => {
    try {
        const accessToken = getTokens(req).accessToken;
        const refreshToken = getTokens(req).refreshToken;
        if (!verifyToken(accessToken) || !verifyToken(refreshToken)) {
            return handleExpiredTokens(req, res);
        }

        // 여기서 Sequelize ORM을 사용하여 쿼리합니다.
        const user = await Users.findOne({
            where: { ref_token: refreshToken },
            attributes: ['is_coop']
        });

        if (!user) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }

        if (user.is_coop === 0) {
            return res.status(401).json({ error: 'Not Coop' });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: 'Token verification failed' });
    }
}

const getInfoFromReqToken = async (req) => {
    const accessToken = getTokens(req).accessToken;
    const payload = verifyToken(accessToken);
    if (!payload) {
        throw new Error('Invalid access token');
    }
    // Sequelize ORM을 사용하여 사용자 정보를 가져옵니다.
    const user = await Users.findOne({
        where: { email: payload.email }
    });
    if (!user) {
        throw new Error('User not found');
    }
    return user; // 사용자 정보를 반환합니다.
};
module.exports = {
    checkTokens,
    checkAdminTokens,
    updateToken,
    getInfoFromReqToken,
    genToken,
    verifyToken,
    updateRefToken,
    getPayload,
};