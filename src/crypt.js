const ecc = require("eciesjs");

function decrypt(data, key) {
    return ecc.decrypt(Buffer.from(key, 'base64'), Buffer.from(data, 'base64')).toString('utf-8');
}

function encrypt(data, key) {
    return ecc.encrypt(Buffer.from(key, 'base64'), Buffer.from(data)).toString('base64')
}

function generateKeys() {
    let key = new ecc.PrivateKey();
    return [key.secret.toString('base64'), Buffer.from(key.publicKey.toBytes()).toString('base64')]
}

module.exports = {
    decrypt, encrypt, generateKeys
}