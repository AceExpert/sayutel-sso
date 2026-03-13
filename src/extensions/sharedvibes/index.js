const { spawn } = require('node:child_process');
const { genOTP } = require('../../utils');

const dbDir = "/home/db/sharedvibes/"
const userDB = new sqlite.DatabaseSync(dbDir + "users.db");
const friendsDB = new sqlite.DatabaseSync(dbDir + "friends.db");

userDB.exec("CREATE TABLE if not exists users(user_id, email, display_name, about, avatar);")
friendsDB.exec("CREATE TABLE if not exists friends(user_id, friend_id, request_id);")

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

function getRelatedUserList(userid, type = 0) {
    switch(type) {
        case 0: {
            let data = friendsDB.prepare('SELECT friend_id from friends where user_id=?;').all(userid);
            return data;
        }

        case 1: {
            let data = friendsDB.prepare('SELECT request_id from friends where user_id=?;').all(userid);
            return data;
        }

        case 2: {
            let data = friendsDB.prepare('SELECT user_id from friends where request_id=?;').all(userid);
            return data;
        }
    }
}

function verifyOTP(otp, session) {
    let otpSession = otpRecord[session];
    return otpSession?.otp === otp;
}

module.exports = {
    otpRecord,
    sendOTP, verifyOTP, getRelatedUserList
}