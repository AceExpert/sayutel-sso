const sqlite = require("node:sqlite");

const userDB = new sqlite.DatabaseSync("users.db");
const sessionDB = new sqlite.DatabaseSync("sessions.db")
const authDB = new sqlite.DatabaseSync("auth.db")

let auth_q = userDB.prepare("SELECT passwd from users WHERE user_id=?;")

let new_session_q = sessionDB.prepare("INSERT INTO sessions (token, key, public_key) VALUES (?, ?, ?);")

function loginUser(user, passwd) {
    let pwd = auth_q.get(user)

    if(pwd) {
        return pwd.passwd === passwd 
    } else {
        return false
    }
}

function createEncSession(token, key, public_key) {
    new_session_q.run(token, key, public_key);
}

function getEncSession(token) {
    let session_q = sessionDB.prepare("SELECT key from sessions WHERE token=?;")

    return session_q.get(token)
}

function createSession(token, user) {
    let auth_q = authDB.prepare("SELECT user_ids from users WHERE token=?;")

    let info = auth_q.get(token);
    let uids = [user]

    if(info?.user_ids?.length) {
        if (info.user_ids.includes(user)) {
            return 2
        } else {
            uids += info.user_ids;
        }
    }

    authDB.prepare("INSERT INTO users (token, user_ids) VALUES (?, ?);").run(token, uids);
    return 1;
}

function getSession(token) {
    let auth_q = authDB.prepare("SELECT user_ids from users WHERE token=?;")

    let info = auth_q.get(token);

    if(!info?.user_ids?.length) {
        return null
    } else {
        return info.user_ids
    }
}

module.exports = {
    loginUser, createEncSession, getEncSession, createSession, getSession
}