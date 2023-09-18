const { verifyToken, genToken, getPayload } = require("../utils/token");
const { executeQueryPromise } = require("../utils/query");

const updateToken = async (tokentype, email, token) => {
    try {
        const query = `UPDATE users SET ${tokentype} = ?  WHERE email = ?`;
        const [results] = await executeQueryPromise(query, [token, email]);
    } catch (error) {
        console.error("Error updating token:", error);
    }
};

async function checkTokens(req, res, next) {
    try {
        const refreshToken = verifyToken(req.header('refresh'));
        const accessToken = verifyToken(req.header('access'));

        if (accessToken === null) {
            if (refreshToken === null) { 
                return res.status(403).send({
                    message : "Expired AllToken, Logout",
                    areTokensVaild: false
                });
            } else { 
                const query = 'SELECT * FROM users WHERE ref_token = ?';
                const [results] = await executeQueryPromise(query, req.header('refresh'));
                if (results.length === 0) {
                    return res.status(401).json({ error: 'Wrong refresh Token' });
                }
                const newAccessToken = await genToken(refreshToken.email, refreshToken.student_name, "1h");
                return res.status(403).send({
                    message : "accToken is renewed",
                    access : newAccessToken
                });
            }
        } else if (refreshToken === null) { 
            const newRefreshToken = await genToken(accessToken.email, accessToken.student_name, "14d");
            await updateToken("ref_token", accessToken.email, newRefreshToken);
            return res.status(403).send({
                message : "refToken is renewed",
                refresh : newRefreshToken
            });
        } else { 
            next();
        }
    } catch (error) {
        console.error("Error in checkTokens:", error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

async function checkAdminTokens(req, res, next) {
    try {
        const refreshToken = verifyToken(req.header('refresh'));
        const accessToken = verifyToken(req.header('access'));
        const query = 'SELECT * FROM users WHERE ref_token = ?';
        const [results] = await executeQueryPromise(query, req.header('refresh'));
        if (results.length === 0) {
            return res.status(401).json({ error: 'Wrong refresh Token' });
        }
        if (results.is_coop == 0) {
            return res.status(401).json({ error: 'Not Coop' });
        }
        if (accessToken === null) { 
            if (refreshToken === null) { 
                return res.status(403).send({
                    message : "Expired AllToken, Logout",
                    areTokensVaild: false
                });
            } else { 
                const newAccessToken = await genToken(refreshToken.email, refreshToken.student_name, "1h");
                return res.status(403).send({
                    message : "accToken is renewed",
                    access : newAccessToken
                });
            }
        } else if (refreshToken === null) { 
            const newRefreshToken = await genToken(accessToken.email, accessToken.student_name, "14d");
            await updateToken("ref_token", accessToken.email, newRefreshToken);
            return res.status(403).send({
                message : "refToken is renewed",
                refresh : newRefreshToken
            });
        } else { 
            next();
        }
    } catch (error) {
        console.error("Error in checkAdminTokens:", error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

module.exports = {
   checkTokens,
   checkAdminTokens,
   updateToken,
}
