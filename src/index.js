const express = require("express");
const ecc = require("eciesjs");

const { loginUser, createEncSession, getEncSession, createSession, getSession } = require("./dbmanager");
const { genToken, getCookies } = require("./utils");
const { decrypt, encrypt } = require("./crypt");

let app = express();

app.post('/session', (req, res, next) => {
    let token = genToken(50);
    res.cookie("sesstoken", token, { httpOnly: true, secure: true })

    let key = new ecc.PrivateKey();
    createEncSession(token, key.secret.toString('base64'), req.body)
    res.send(key.publicKey.toBytes().toString('base64'))
})

app.post('/login', (req, res, next) => {
    let cookies = getCookies(req.cookies);

    let session = getEncSession(cookies.find(v => v.name === 'sesstoken'))

    if(!session) {
        res.json({error: 2, msg: "Invalid session"})
        return
    }
    let data = JSON.parse(decrypt(res.body, session.key))
    if(loginUser(data.user, data.pswd)) {
        let token = genToken(256);
        createSession(token, data.user);
        res.cookie("token", token, {httpOnly: true, secure: true, maxAge: 3600 * 1000 * 24 * 30})
        res.body(encrypt(JSON.stringify({error: 0, auth: true}), session.public_key));
    } else {
        res.body(encrypt(JSON.stringify({error: 1, msg: 'wrong username or password', auth: false}), session.public_key));
    }
})

app.post('/auth', (req, res, next) => {
    let cookies = getCookies(req.cookies);

    let session = getEncSession(cookies.find(v => v.name === 'sesstoken'))
    if(!session) {
        res.json({error: 2, msg: "Invalid session"})
        return
    }
    
    let uids = getSession(cookies.find(v => v.name === 'token'))
    
    if(uids) {
        res.body(encrypt(JSON.stringify(uids), session.public_key))
    } else {
        res.body(encrypt(JSON.stringify({error: 1, msg: 'invalid token', auth: false}), session.public_key));
    }
})

app.listen(5100, () => {
    console.log("Sayutel SSO Service is live @ localhost:5100");
})