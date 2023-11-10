const { verifyToken, genToken } = require("@token");
const { executeQueryPromise } = require('@query');
const { JsonWebTokenError } = require("jsonwebtoken");

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
        const query = 'SELECT * FROM users WHERE ref_token = ?';
        const results = await executeQueryPromise(query, [refreshToken]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }

        if (!verifyToken(accessToken)) {
            const newAccessToken = await genToken(refreshToken.email, refreshToken.student_name, "1h");
            res.cookie('accessToken', newAccessToken, { httpOnly: true });
            return res.status(401).send({
                message : "accToken is renewed",
                access : newAccessToken
            });
        }

        if (!verifyToken(refreshToken)) {
            const newRefreshToken = await genToken(accessToken.email, accessToken.student_name, "14d");
            await updateToken("ref_token", accessToken.email, newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
            return res.status(401).send({
                message : "refToken is renewed",
                refresh : newRefreshToken
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

async function checkAdminTokens(req, res, next) {
    try {
        const accessToken = getTokens(req).accessToken;
        const refreshToken = getTokens(req).refreshToken;
        if (!verifyToken(accessToken) || !verifyToken(refreshToken)) {
            return handleExpiredTokens(req, res);
        }

        const query = 'SELECT is_coop FROM users WHERE ref_token = ?';
        const results = await executeQueryPromise(query, [refreshToken]);
        // console.log(results)
        if (results.length === 0) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }
        if (results[0].is_coop == 0) {
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
    // console.log(verifyToken(accessToken).email)
    return (verifyToken(accessToken));
};

module.exports = {
    checkTokens,
    checkAdminTokens,
    updateToken,
    getInfoFromReqToken,
};
