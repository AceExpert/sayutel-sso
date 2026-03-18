const { spawn } = require('node:child_process');
const { genOTP, genToken } = require('../../../utils');

const {
    authDB, friendsDB, userDB, 
    getAuthUser, getUser, getRelatedUserList,
    createUserID
} = require("./db");

let otpRecord = {};

function sendOTP(email, session) {

    let otp = genOTP();

    const postbirdProc = spawn("postbird", [
        '-f', 'sayu@sayutel.com', 
        '-t', email, 
        '-s', `SharedVibes Login OTP`,
        '-m', `The OTP to login to your SharedVibes account is ${otp}. Do not share this code with anyone. Please ignore and report immediately if this isn't you.`,
        '--sign', 'sharedvibes.net',
        '--no-save'
    ])

    otpRecord[session] = {email, otp};

    return otp;
}

function verifyOTP(otp, session) {
    let otpSession = otpRecord[session];
    
    if(otpSession?.otp === otp) {
        let tok = genToken(256);
        let user = getUser(otpSession.email);
        let uid = user.uid || createUserID()
        if(!user) {
            userDB.prepare("INSERT INTO users (uid, email) VALUES (?, ?);").run(uid, otpSession.email);
        }
        authDB.prepare("INSERT INTO users (uid, email, token) VALUES (?, ?, ?);").run(uid, otpSession.email, tok);
        delete otpRecord[session];
        return [tok, !user? {uid: uid, email: otpSession.email} : user];
    } else {

    }
}

module.exports = {
    otpRecord,
    sendOTP, verifyOTP, getRelatedUserList
}