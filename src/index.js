const express = require("express");
const ecc = require("eciesjs");

const { 
    loginUser, 
    createEncSession, getEncSession, 
    createSession, getSession,
    validateUserId,
    getUser, createUser,
    verifyUser
} = require("./dbmanager");
const { genToken, getCookies } = require("./utils");
const { decrypt, encrypt } = require("./crypt");

const { addWisher } = require("./extensions/waitlist");
const sputhmail = require("./extensions/sputhmail");
const shaleen = require("./extensions/shaleen");

const emailPat =  /[a-zA-Z0-9\$%\-#&\.]+@(?:[a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(?:[a-zA-Z0-9\-]+\.)?[a-zA-Z0-9\-]+/;

let app = express();

app.use((req, res, next) => {
    if(['http://cybertron:3500', 'http://cybertron:3000',
        'http://localhost:3012',
        'https://accounts.sayutel.com', 
        'https://cytroid.in', 'https://www.cytroid.in', 'https://sputh.me', 'https://www.sputh.me', 'https://mail.sayutel.com', 
        'https://www.shaleen.net', 'https://shaleen.net'].includes(req.headers.origin)) {
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

let secureCookie = origin => origin.startsWith('http://cybertron') ? undefined : true

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

        res.cookie("sesstoken", ftoken, { httpOnly: true, secure: secureCookie(req.headers.origin), sameSite: "none", domain: ".sayutel.com" })
        res.send(Buffer.from(key.publicKey.toBytes()).toString('base64'))
    }
)

app.post('/login', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;
    let currentToken = cookies.find(v => v.name === 'token')?.value

    let data = JSON.parse(decrypt(req.body, session.key))
    let user = getUser(data.user);

    if(user?.passwd === data.pswd) {
        // let [sessCode, token] = createSession(currentToken, emailPat.test(data.user) ? data.user : (user.user_id + '@' + user.domain), genToken(256));
        let [sessCode, token] = createSession(currentToken, user.user_id + '@' + user.domain, genToken(256));
        res.cookie("token", token, {httpOnly: true, secure: secureCookie(req.headers.origin), maxAge: 3600 * 1000 * 24 * 30, sameSite: "none", domain: ".sayutel.com"})
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

app.post('/create', resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;

    let data = JSON.parse(decrypt(req.body, session.key));

    if(!emailPat.test(data.user)) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid email'})));
        return;
    };

    if(validateUserId(data.user)) {
        res.send(encrypt(JSON.stringify({error: 2, msg: 'user exists'}), session.public_key));
    } else {
        let vtoken = genToken(25);
        let result = createUser(data.user, {token: vtoken});
        if(result === 3) {
            res.send(encrypt(JSON.stringify({error: 0, result: 1, otp: vtoken}, session.public_key)))
        } else if (result === 2) {

        } else if (result === 1) {
            res.send(encrypt(JSON.stringify({error: 2, msg: 'user exists'}), session.public_key));
        }
    }
})

app.post('/verify', resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;

    let data = JSON.parse(decrypt(req.body, session.key));

    let result = verifyUser(data.token, data.otp);
    if(result === 0) {
        res.send(encrypt(JSON.stringify({error: 0, msg: 'verified'}), session.public_key))
    } else if (result === 1) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'wrong otp'}), session.public_key))
    } else if (result === 2) {
        res.send(encrypt(JSON.stringify({error: 2, msg: 'invalid session'}), session.public_key))
    }
})

app.post('/validate', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let session = req.sessionInfo;

    let data = decrypt(req.body, session.key).trim();

    if(!emailPat.test(data)) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid email'}), session.public_key))
        return;
    }

    let result = validateUserId(data);

    if (result === 1) {
        res.send(encrypt(JSON.stringify({error: 0}), session.public_key))
    } else if (result === 0) {
        res.send(encrypt(JSON.stringify({error: 2, msg: 'not a valid user'}), session.public_key))
    }
})

app.post('/cytroid/wishlist/join', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let session = req.sessionInfo;

    let data = decrypt(req.body, session.key).trim();

    if(!emailPat.test(data)) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid email'}), session.public_key))
        return;
    }

    if(addWisher(data)) {
        res.send(encrypt(JSON.stringify({error: 0, msg: 'joined'}), session.public_key))
    } else {
        res.send(encrypt(JSON.stringify({error: 2, msg: 'exists already'}), session.public_key))
    };
})

app.get('/mail/:u/access', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;

    let uids = getSession(cookies.find(v => v.name === 'token')?.value)
    let uindex = Number.parseInt(req.params.u);
    
    if(uids) {
        let user = uids[uindex];
        if(user) {
            let ntok = genToken(128);
            sputhmail.addUser(user, ntok);
            res.send(encrypt(JSON.stringify({error: 0, msg: 'ws token', token: ntok}), session.public_key));
        } else {
            res.send(encrypt(JSON.stringify({error: 2, msg: 'invalid user'}), session.public_key));
        }
    } else {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid token', auth: false}), session.public_key));
    }
})

app.post('/shaleen/contact', rawMiddlware, resolveCookies, validateEncSession, (req, res, next) => {
    let cookies = req.cookies;

    let session = req.sessionInfo;

    let data = JSON.parse(decrypt(req.body, session.key).trim());

    if(!emailPat.test(data.email)) {
        res.send(encrypt(JSON.stringify({error: 1, msg: 'invalid email'}), session.public_key))
        return;
    }

    let res = shaleen.sendMail(data);

    if(!res) {
        res.send(encrypt(JSON.stringify({error: 0, msg: 'sent'}), session.public_key));
    } else {

    }

})

app.listen(5100, () => {
    console.log("Sayutel SSO Service is live @ localhost:5100");
})