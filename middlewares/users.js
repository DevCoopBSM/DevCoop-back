const { verifyToken, genToken } = require("../utils/token");
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
    	/**
         * access token 자체가 없는 경우엔 에러(401)를 반환
         * 클라이언트측에선 401을 응답받으면 로그인 페이지로 이동시킴
         */
        if (req.header('access') === undefined) throw Error('API 사용 권한이 없습니다.'); 
        const accessToken = verifyToken(req.header('access'));
        const query = 'SELECT * FROM users WHERE ref_token = ?';
        const [results] = await connection.promise().query(query, req.header('refresh'));
        console.log(results)
        const refreshToken = results[0].ref_token;
        const email = results[0].email;
        const student_name = results[0].student_name;// *실제로는 DB 조회
        
        if (accessToken === null) {
            if (refreshToken === undefined) { // case1: access token과 refresh token 모두가 만료된 경우
                throw Error('API 사용 권한이 없습니다.');
            } else { // case2: access token은 만료됐지만, refresh token은 유효한 경우
                const newAccessToken = genToken( email, student_name, "1h" )
                // jwt.sign({ userId, userName },S
                //     process.env.JWT_SECRET, {
                //     expiresIn: '1h',
                //     issuer: 'cotak'
                // });
                res.status(200).send({access : newAccessToken});
                //req.headers('access') = newAccessToken;
                next();
            }
        } else {
            if (refreshToken === undefined) { // case3: access token은 유효하지만, refresh token은 만료된 경우
                const newRefreshToken = genToken( email, student_name, "14d" );
                updateToken("ref_token", email, refreshToken);
                res.status(200).send({refresh : newRefreshToken});
                //req.headers('refrash') = newRefreshToken;
                next();
            } else { // case4: accesss token과 refresh token 모두가 유효한 경우
                console.log("Token are all right")
                next();
            }
        }
    },
}