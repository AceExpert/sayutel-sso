const { spawn } = require('node:child_process');

const {contactHTML, contactRHTML} = require("./constants");

function sendMail({name, email, message}) {
    const postbirdProc = spawn("postbird", [
        '-f', 'sayu@shaleen.net', 
        '-t', 'very.anshul@gmail.com', 
        '--to-name', 'Shaleen Singh', 
        '--headers', `Reply-To: ${name} <${email}>`,
        '-s', `Contact Request from ${name} through shaleen.net`,
        '--html', contactHTML(name, email, message),
        '-m', `Dear Shaleen\nSomeone named ${name} has sent you a message through your website to contact you. The details are given below.\n\nYou can directly reply to this email to reply to them.\n\nName:\n${name}\n\nEmail:\n${email}\n\nMessage:\n${message}\n\n__________________`,
        '--name', `${name} (via shaleen.net)`,
        '--sign', 'sayutel.com',
        '--no-save'
    ])

    const postbirdRProc = spawn("postbird", [
        '-f', 'sayu@shaleen.net', 
        '-t', email, 
        '--to-name', name, 
        '-s', `Contact Request Sent from ${name} to Shaleen`,
        '--html', contactRHTML(name, email, message),
        '-m', `Dear ${name}\nYour message has been sent to Shaleen in her mail. Below is a copy of your responses.\n\nThis email is just a receipt. Do not reply to it.\n\nName:\n${name}\n\nEmail:\n${email}\n\nMessage:\n${message}\n\n__________________`,
        '--name', 'shaleen.net',
        '--sign', 'sayutel.com',
        '--no-save'
    ])

    return 0;
}

module.exports = {
    sendMail
};