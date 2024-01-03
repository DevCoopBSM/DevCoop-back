const { verify, sign } = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { executeQuery, executeQueryPromise } = require("@query");
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
};

const genToken = async (email, name, expiretime) => {
  console.log("genToken!");
  try {
    const user = await Users.findOne({ where: { email: email } });
    // 사용자가 데이터베이스에 없을 경우 에러를 던집니다.
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    console.log(user.code_number);
    const payload = {
      email: email,
      name: name,
      code_number: user.code_number,
    };

    return sign(payload, process.env.SECRET_KEY, { expiresIn: expiretime });
  } catch (error) {
    // 에러 로깅을 합니다.
    console.error("토큰 생성 중 에러 발생:", error);
    // 에러를 던지거나, 에러를 처리하는 방법에 따라 다른 값을 반환할 수 있습니다.
    throw error;
  }
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
  const payload = token.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
};

const clearAllCookies = async (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("isLoggedIn");
  res.clearCookie("isAdminLoggedIn");
};

const updateToken = async (tokentype, email, token) => {
  try {
    const query = "UPDATE users SET ? = ? WHERE email = ?";
    await executeQueryPromise(query, [tokentype, token, email]);
  } catch (error) {
    await clearAllCookies(res);
  }
};

function getTokens(req) {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;
  return { accessToken: accessToken, refreshToken: refreshToken };
}

const handleExpiredTokens = async (req, res) => {
  const accessToken = getTokens(req).accessToken;
  const refreshToken = getTokens(req).refreshToken;
  console.log("Received refreshToken:", refreshToken); // 추가된 로깅
  try {
    const user = await Users.findOne({ where: { ref_token: refreshToken } });
    if (!user) {
      await clearAllCookies(res);
      res.redirect("/admin/login");
      return res.status(302);
    }
    console.log(user);
    if (!verifyToken(accessToken)) {
      const newAccessToken = await genToken(
        user.email,
        user.student_name,
        "1h",
      );
      res.cookie("accessToken", newAccessToken, { httpOnly: true });
      return res.status(401).send({
        message: "accToken is renewed",
      });
    }
    accessToken = verifyToken(accessToken);
    if (!verifyToken(refreshToken)) {
      const newRefreshToken = await genToken(
        accessToken.email,
        accessToken.student_name,
        "14d",
      );
      await updateToken("ref_token", accessToken.email, newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
      res.redirect("/admin/login");
      return res.status(401).send({
        message: "refToken is renewed",
      });
    }
    // 위의 조건 모두 실패하면 로그아웃 진행
    await clearAllCookies(res);
    res.redirect("/admin/login");
    return res.status(302).send({
      message: "Renewing Token is fail, logout",
    });
  } catch (error) {
    // 에러가 나도 로그아웃!
    await clearAllCookies(res);
    console.error("Error in handleExpiredTokens:", error);
    return res.status(302).send({
      message: "handleExpiredTokens is Fail",
    });
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
      attributes: ["is_coop"],
    });

    if (!user) {
      return res.status(401).json({ error: "Wrong refresh Token" });
    }

    if (user.is_coop === 0) {
      return res.status(401).json({ error: "Not Coop" });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Token verification failed" });
  }
};

const getInfoFromReqToken = async (req) => {
  const accessToken = getTokens(req).accessToken;
  const payload = verifyToken(accessToken);
  if (!payload) {
    throw new Error("Invalid access token");
  }
  // Sequelize ORM을 사용하여 사용자 정보를 가져옵니다.
  const user = await Users.findOne({
    where: { email: payload.email },
  });
  if (!user) {
    throw new Error("User not found");
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
