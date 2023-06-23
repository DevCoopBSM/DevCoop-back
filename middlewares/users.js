const { verifyToken, genToken, getPayload } = require("../utils/token");
const mysql = require('mysql2');
const dbconfig = require('../config/db');
const connection = mysql.createConnection(dbconfig);


const updateToken = async (tokentype, email, token) => {
    const query = `UPDATE users SET ${tokentype} = ?  WHERE email = ?`;
    const [results] = await connection.promise().query(query, [token, email]);
    // console.log(results);
};


module.exports = {
    async checkTokens(req, res, next) {
        const refreshToken = verifyToken(req.header('refresh'));
        const accessToken = verifyToken(req.header('access'));

        if (accessToken === null) {
            if (refreshToken === null) { // case1: access token과 refresh token 모두가 만료된 경우
                console.log("all token are expired")
                return(res.status(403).send({
                    message : "Expired AllToken, Logout",
                    areTokensVaild: false
            }));
            } else { // case2: access token은 만료됐지만, refresh token은 유효한 경우
                // Refreash 토큰 DB로 검증 
                const query = 'SELECT * FROM users WHERE ref_token = ?';
                const [results] = await connection.promise().query(query, req.header('refresh'));
                // console.log(results)
                if (results.length === 0) {
                    return res.status(401).json({ error: 'Wrong refresh Token' });
                }
                const newAccessToken = await genToken( refreshToken.email, refreshToken.student_name, "1h" )
                console.log("accToken is renewed")
                res.status(403).send({
                    message : "accToken is renewed",
                    access : newAccessToken
                });
                next();
            }
        } else {
            if (refreshToken === null) { // case3: access token은 유효하지만, refresh token은 만료된 경우
                const newRefreshToken = await genToken( accessToken.email, accessToken.student_name, "14d" );
                updateToken("ref_token", accessToken.email, newRefreshToken);
                console.log("refToken is renewed")
                res.status(403).send({
                    message : "refToken is renewed",
                    refresh : newRefreshToken
                });
                next();
            } else { // case4: accesss token과 refresh token 모두가 유효한 경우
                console.log("Token are all right")
                next();
            }
        }
    },
}