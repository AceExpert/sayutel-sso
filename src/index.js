const express = require("express");

const { authUser } = require("./dbmanager");
const { genToken } = require("./utils");

let app = express();

app.post('/authorize', express.json(), (req, res, next) => {
    if(authUser(req.body.user, req.body.pswd)) {
        res.cookie("token", genToken(256), {httpOnly: true, secure: true})
        res.json({error: 0, auth: true});
    } else {
        res.json({error: 1, msg: 'wrong username or password'})
    }
})

app.listen(5100, () => {
    console.log("Sayutel SSO Service is live @ localhost:5100");
})