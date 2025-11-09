const { spawn } = require('node:child_process');

const {contactHTML, contactRHTML} = require("./constants");

function sendMail({name, email, message}) {
    const postbirdProc = spawn("postbird", [
        '-f', 'sayu@shaleen.net', 
        '-t', 'very.anshul@gmail.com', 
        '--to-name', 'Shaleen Singh', 
        '-s', `Contact Request from ${name} through shaleen.net`,
        '--html', contactHTML(name, email, message),
        '--name', 'shaleen.net',
        '--sign', 'sayutel.com',
        '--no-save'
    ])

    const postbirdRProc = spawn("postbird", [
        '-f', 'sayu@shaleen.net', 
        '-t', email, 
        '--to-name', name, 
        '-s', `Contact Request Sent from ${name} to Shaleen`,
        '--html', contactRHTML(name, email, message),
        '--name', 'shaleen.net',
        '--sign', 'sayutel.com',
        '--no-save'
    ])

    return 0;
}

module.exports = {
    sendMail
};