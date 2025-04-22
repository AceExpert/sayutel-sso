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
    let session_q = sessionDB.prepare("SELECT key, public_key from sessions WHERE token=?;")

    return session_q.get(token)
}

function createSession(token, user, newToken) {
    
    let auth_q = authDB.prepare("SELECT user_ids from users WHERE token=?;")

    let info = token? auth_q.get(token) : null;
    let uids = [user]

    if(info) {
        let user_ids = JSON.parse(info.user_ids);
        if (user_ids.includes(user)) {
            return [3, token]
        } else {
            uids += user_ids;
            authDB.prepare("UPDATE users SET user_ids=?, token=? WHERE token=?;").run(JSON.stringify(uids), newToken, token);
            return [2, newToken]
        }
    } else {
        authDB.prepare("INSERT INTO users (token, user_ids) VALUES (?, ?);").run(newToken, JSON.stringify(uids));
        return [1, newToken];
    }

}

function getSession(token) {
    let auth_q = authDB.prepare("SELECT user_ids from users WHERE token=?;")

    let info = auth_q.get(token);

    if(info) {
        let user_ids = JSON.parse(info.user_ids);
        if(user_ids?.length) {
            return user_ids;
        } else {
            authDB.prepare("DELETE FROM users WHERE token=?;").run(token);
            return null
        }
    } else {
        return null
    }
}

module.exports = {
    loginUser, createEncSession, getEncSession, createSession, getSession
}