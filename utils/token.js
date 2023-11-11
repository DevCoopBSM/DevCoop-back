const {verify, sign} = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const {executeQuery, executeQueryPromise} = require('@query')
const crypto = require("crypto");


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


const genToken = (email, name, expiretime) => {
    console.log("genToken!");
    const Payload = {
        email: email,
        name: name
    }
    const token = sign(Payload, process.env.SECRET_KEY, { expiresIn: expiretime });
    //const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
    //console.log(verifiedToken);
    return token;
};

const updateRefToken = async (email, token) => {
    const query = `UPDATE users SET ref_token = ?  WHERE email = ?`;
    executeQuery(query, [token, email], (err, result) => {
        if (err) throw err;
        console.log("update refreshtoken");
        if (result && result.length > 0) {
          console.log(result);
          return result;
        } else {
            console.log("refresh update error");
        };
    });
};

// 
// function base64(json) {
//     const stringified = JSON.stringify(json);
//     // JSON을 문자열화
//     const base64Encoded = Buffer.from(stringified).toString("base64");
//     // 문자열화 된 JSON 을 Base64 로 인코딩
//     const paddingRemoved = base64Encoded.replaceAll("=", "");
//     // Base 64 의 Padding(= or ==) 을 제거
  
//     return paddingRemoved;
//   }

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
    genToken,
    verifyToken,
    updateRefToken,
    getPayload,
};