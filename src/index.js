const express = require("express");
const ecc = require("eciesjs");

const { loginUser, createEncSession, getEncSession, createSession, getSession } = require("./dbmanager");
const { genToken, getCookies } = require("./utils");
const { decrypt, encrypt } = require("./crypt");

let app = express();

let rawMiddlware = (req, res, next) => {
    req.body = '';

    req.on('data', d => req.body += d);
    req.on('end', () => next())
};

let resolveCookies = (req, res, next) => {
    req.cookies = getCookies(req.headers['cookie']);
    next();
}

app.post('/session', rawMiddlware, 
    (req, res, next) => {
        let token = genToken(50);
        res.cookie("sesstoken", token, { httpOnly: true, secure: true })

        let key = new ecc.PrivateKey();
        createEncSession(token, key.secret.toString('base64'), req.body)
        res.send(Buffer.from(key.publicKey.toBytes()).toString('base64'))
    }
)

app.post('/login', rawMiddlware, resolveCookies, (req, res, next) => {
    let cookies = req.cookies;

    let session = getEncSession(cookies.find(v => v.name === 'sesstoken')?.value)
    let currentToken = cookies.find(v => v.name === 'token')?.value

    if(!session) {
        res.json({error: 2, msg: "Invalid session"})
        return
    }
    let data = JSON.parse(decrypt(req.body, session.key))
    if(loginUser(data.user, data.pswd)) {
        let [sessCode, token] = createSession(currentToken, data.user, genToken(256));
        res.cookie("token", token, {httpOnly: true, secure: true, maxAge: 3600 * 1000 * 24 * 30})
        res.send(encrypt(JSON.stringify({error: 0, auth: true, extra: sessCode}), session.public_key));
    } else {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'wrong username or password', auth: false}), session.public_key));
    }
})

app.post('/auth', resolveCookies, (req, res, next) => {
    let cookies = req.cookies;

    let session = getEncSession(cookies.find(v => v.name === 'sesstoken')?.value)
    if(!session) {
        res.json({error: 2, msg: "Invalid session"})
        return
    }

    let uids = getSession(cookies.find(v => v.name === 'token')?.value)
    
    if(uids) {
        res.send(encrypt(JSON.stringify(uids), session.public_key))
    } else {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid token', auth: false}), session.public_key));
    }
})

app.listen(5100, () => {
    console.log("Sayutel SSO Service is live @ localhost:5100");
})