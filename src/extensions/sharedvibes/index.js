const { spawn } = require('node:child_process');
const { genOTP } = require('../../utils');

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
    return otpSession?.otp === otp;
}

module.exports = {
    sendOTP, otpRecord, verifyOTP
}