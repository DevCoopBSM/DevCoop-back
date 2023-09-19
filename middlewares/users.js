const { verifyToken, genToken, getPayload } = require("../utils/token");
const { executeQueryPromise } = require("../utils/query");

const updateToken = async (tokentype, email, token) => {
    try {
        const query = `UPDATE users SET ${tokentype} = ? WHERE email = ?`;
        await executeQueryPromise(query, [token, email]);
    } catch (error) {
        console.error("Error updating token:", error);
    }
};

const handleExpiredTokens = async (accessToken, refreshToken, req, res) => {
    console.log('Received refreshToken:', refreshToken); // 추가된 로깅
    try {
        const query = 'SELECT * FROM users WHERE ref_token = ?';
        const [results] = await executeQueryPromise(query, refreshToken);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }

        if (!accessToken) {
            const newAccessToken = await genToken(refreshToken.email, refreshToken.student_name, "1h");
            res.cookie('accessToken', newAccessToken, { httpOnly: true });
            return res.status(403).send({
                message : "accToken is renewed",
                access : newAccessToken
            });
        }

        if (!refreshToken) {
            const newRefreshToken = await genToken(accessToken.email, accessToken.student_name, "14d");
            await updateToken("ref_token", accessToken.email, newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
            return res.status(403).send({
                message : "refToken is renewed",
                refresh : newRefreshToken
            });
        }
    } catch (error) {
        console.error("Error in handleExpiredTokens:", error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

async function checkTokens(req, res, next) {
    const refreshToken = verifyToken(req.cookies.refreshToken);
    const accessToken = verifyToken(req.cookies.accessToken);
    
    if (!accessToken || !refreshToken) {
        return handleExpiredTokens(accessToken, refreshToken, req, res);
    }

    next();
}

async function checkAdminTokens(req, res, next) {
    const refreshToken = verifyToken(req.cookies.refreshToken);
    const accessToken = verifyToken(req.cookies.accessToken);
    const query = 'SELECT * FROM users WHERE ref_token = ?';
    const [results] = await executeQueryPromise(query, refreshToken);

    if (results.length === 0) {
        return res.status(401).json({ error: 'Wrong refresh Token' });
    }
    if (results.is_coop == 0) {
        return res.status(401).json({ error: 'Not Coop' });
    }

    if (!accessToken || !refreshToken) {
        return handleExpiredTokens(accessToken, refreshToken, req, res);
    }

    next();
}

module.exports = {
    checkTokens,
    checkAdminTokens,
    updateToken
};
