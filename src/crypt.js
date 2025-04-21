const ecc = require("eciesjs");

function decrypt(data, key) {
    return ecc.decrypt(Buffer.from(key, 'base64'), Buffer.from(data, 'base64')).toString('utf-8');
}

function encrypt(data, key) {
    return ecc.encrypt(Buffer.from(key, 'base64'), Buffer.from(data))
}

module.exports = {
    decrypt, encrypt
}