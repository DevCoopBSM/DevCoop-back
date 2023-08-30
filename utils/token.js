const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { connection } = require("../utils/query");
const crypto = require("crypto");

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
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
};

const genToken = async (email, name, expiretime) => {
  const Payload = {
    email: email,
    name: name,
  };

  const token = jwt.sign(Payload, process.env.SECRET_KEY, {
    expiresIn: expiretime,
  });

  //const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
  //console.log(verifiedToken);

  return token;
};

const updateRefToken = async (email, token) => {
  const query = `UPDATE users SET ref_token = ?  WHERE email = ?`;
  connection.query(query, [token, email]);
};
//
function base64(json) {
  const stringified = JSON.stringify(json);
  // JSON을 문자열화
  const base64Encoded = Buffer.from(stringified).toString("base64");
  // 문자열화 된 JSON 을 Base64 로 인코딩
  const paddingRemoved = base64Encoded.replaceAll("=", "");
  // Base 64 의 Padding(= or ==) 을 제거

  return paddingRemoved;
}

// 아래 코드는 토큰에서 payload부분 해독하여 이메일 등을 추출하려고 달아둠
const getPayload = (token) => {
  const Payload = token.split(".")[1];
  return Buffer.from(payload, "base64").toString("utf8");
};

exports.genToken = genToken;
exports.verifyToken = verifyToken;
exports.updateRefToken = updateRefToken;
exports.getPayload = getPayload;
