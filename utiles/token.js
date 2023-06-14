const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();


const genToken = async (email, name, expiretime) => {

    const Payload = {
        email: email,
        name: name
    }


    const token = jwt.sign(Payload,process.env.SECRET_KEY,{expiresIn:expiretime} );

    const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifiedToken);
    
 
    return token
};


// const genToken = async (email, name, expiretime) => {
//     const Header = {
//         type: "JWT",
//         issur: "AriSori"
//     };

//     const encodedHeader = Buffer.from(JSON.stringify(Header)).toString('base64');

//     const Payload = {
//         email: email,
//         name: name
//     }

//     const encodedPayload = Buffer.from(JSON.stringify(Payload)).toString('base64');

//     const expiresIn = expiretime; // 토큰 유지시간 설정

//     const signature = crypto
//         .createHmac("sha256", process.env.SECRET_KEY, { expiresIn })
//         .update(`${encodedHeader}.${encodedPayload}`)
//         .digest("base64")
//         .replace(/=/g, "");

//     console.log([Header, Payload])
//     const token = `${encodedHeader}.${encodedPayload}.${signature}`;

//     // const verifiedToken = jwt.verify(token, process.env.SECRET_KEY);
//     // console.log(verifiedToken);
    
 
//     return token
// };




exports.genToken = genToken;
