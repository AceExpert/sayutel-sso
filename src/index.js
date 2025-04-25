const express = require("express");
const ecc = require("eciesjs");

const { 
    loginUser, 
    createEncSession, getEncSession, 
    createSession, getSession,
    validateUserId,
} = require("./dbmanager");
const { genToken, getCookies } = require("./utils");
const { decrypt, encrypt } = require("./crypt");

const emailPat =  /[a-zA-Z0-9\$%\-#&\.]+@(?:[a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(?:[a-zA-Z0-9\-]+\.)?[a-zA-Z0-9\-]+/;

let app = express();

app.use((req, res, next) => {
    if(['http://cybertron:3500', 'https://accounts.sayutel.com'].includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://accounts.sayutel.com');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('X-Powered-By', 'Sayutel')
    next()
})

let rawMiddlware = (req, res, next) => {
    req.body = '';

    req.on('data', d => req.body += d);
    req.on('end', () => next())
};

let resolveCookies = (req, res, next) => {
    req.cookies = getCookies(req.headers['cookie']);
    next();
}

let secureCookie = origin => origin === 'http://cybertron:3500' ? undefined : true

let validateEncSession = (req, res, next) => {
    let session = getEncSession(req.cookies.find(v => v.name === 'sesstoken')?.value)

    if(!session) {
        res.json({error: 2, msg: "Invalid session"})
        return;
    };
    req.sessionInfo = session;
    next();
}

app.post('/session', rawMiddlware, resolveCookies, 
    (req, res, next) => {
        let token = req.cookies.find(v => v.name === 'sesstoken')?.value;

        let key = new ecc.PrivateKey();
        let ftoken = createEncSession(genToken(55), key.secret.toString('base64'), req.body, token)

        res.cookie("sesstoken", ftoken, { httpOnly: true, secure: secureCookie(req.headers.origin) })
        res.send(Buffer.from(key.publicKey.toBytes()).toString('base64'))
    }
)

app.post('/login', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;
    let currentToken = cookies.find(v => v.name === 'token')?.value

    let data = JSON.parse(decrypt(req.body, session.key))
    if(loginUser(data.user, data.pswd)) {
        let [sessCode, token] = createSession(currentToken, data.user, genToken(256));
        res.cookie("token", token, {httpOnly: true, secure: secureCookie(req.headers.origin), maxAge: 3600 * 1000 * 24 * 30})
        res.send(encrypt(JSON.stringify({error: 0, auth: true, extra: sessCode}), session.public_key));
    } else {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'wrong username or password', auth: false}), session.public_key));
    }
})

app.post('/auth', resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;

    let uids = getSession(cookies.find(v => v.name === 'token')?.value)
    
    if(uids) {
        res.send(encrypt(JSON.stringify(uids), session.public_key))
    } else {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid token', auth: false}), session.public_key));
    }
})

app.post('/validate', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let session = req.sessionInfo;

    let data = decrypt(req.body, session.key).trim();

    if(!emailPat.test(data)) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'not a valid email'}), session.public_key))
        return;
    }

    let result = validateUserId(data);

    if(result === 2) {
        res.send(encrypt(JSON.stringify({error: 3, msg: 'not a valid domain'}), session.public_key))
    } else if (result === 1) {
        res.send(encrypt(JSON.stringify({error: 0}), session.public_key))
    } else if (result === 0) {
        res.send(encrypt(JSON.stringify({error: 2, msg: 'not a valid user'}), session.public_key))
    }
})

app.listen(5100, () => {
    console.log("Sayutel SSO Service is live @ localhost:5100");
})