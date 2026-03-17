const sqlite = require("node:sqlite");

const { genOTP } = require("./utils");

const dbDir = "/home/db/sayutel/"

const userDB = new sqlite.DatabaseSync(dbDir + "users.db");
const sessionDB = new sqlite.DatabaseSync(dbDir + "sessions.db")
const authDB = new sqlite.DatabaseSync(dbDir + "auth.db")
const verifyDB = new sqlite.DatabaseSync(dbDir + "verify.db")

userDB.exec("CREATE TABLE if not exists users(user_id, passwd, domain, dom_alias, phone, country_code);")
sessionDB.exec("CREATE TABLE if not exists sessions(token, key, public_key);")
authDB.exec("CREATE TABLE if not exists users(token, user_ids);")
verifyDB.exec("CREATE TABLE if not exists users(token, email, phone, otp);")

let doms = ['sputh.me']
let reserved = ['cytroid.in', 'sharedvibes.in', 'sayutel.com', 'cyshul.com']

function loginUser(userid, passwd) {
    let [user, domain] = userid.split('@');
    if(!domain) {
        domain = 'sayutel.com';
    }
    
    let fuser = getUser(`${user}@${domain}`);

    if(fuser) {
        return fuser.passwd === passwd;
    } else {
        return false;
    }
}

function createUser(email, {passwd, phone, dob, token}) {
    if(getUser(email)) {
        return 1;
    }

    let [user, domain] = email.split('@');

    if(doms.includes(domain)) {
    } else {
        verifyDB.prepare("INSERT INTO users VALUES(?, ?, ?, ?);").run(token, email, null, genOTP());
        return 3;
    }
}

function verifyUser(token, otp) {
    let to_verify = verifyDB.prepare('SELECT otp, email, phone from users WHERE token=?;').get(token);
    if(!to_verify) {
        return 2;
    }
    if(to_verify.otp === otp) {
        if(to_verify.email) {
            let [user, domain] = to_verify.email.split('@');
            userDB.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?);').run(user, null, domain, null, null, null);
    
        } else if (to_verify.phone) {
            let phone = to_verify.phone;
            userDB.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?);').run(null, null, null, null, phone, null);
            
        } else {
            return 2;
        }
        return 0;
    } else {
        return 1;
    }
}

function createEncSession(token, key, public_key, check) {
    if(check) {
        if (sessionDB.prepare("UPDATE sessions SET token=?, key=?, public_key=? WHERE token=?;").run(token, key, public_key, check).changes) {
            return token;
        };
    };
    let new_session_q = sessionDB.prepare("INSERT INTO sessions (token, key, public_key) VALUES (?, ?, ?);")

    new_session_q.run(token, key, public_key);
    return token;
}

function getEncSession(token) {
    if(!token) return null;
    let session_q = sessionDB.prepare("SELECT key, public_key from sessions WHERE token=?;")

    return session_q.get(token)
}

function createSession(token, user, newToken) {
    
    let auth_q = authDB.prepare("SELECT user_ids from users WHERE token=?;")

    let info = token? auth_q.get(token) : null;

    if(info) {
        let user_ids = JSON.parse(info.user_ids);
        if (user_ids.includes(user)) {
            return [3, token]
        } else {
            let uids = [...user_ids, user];
            authDB.prepare("UPDATE users SET user_ids=?, token=? WHERE token=?;").run(JSON.stringify(uids), newToken, token);
            return [2, newToken]
        }
    } else {
        authDB.prepare("INSERT INTO users (token, user_ids) VALUES (?, ?);").run(newToken, JSON.stringify([user]));
        return [1, newToken];
    }

}

function getSession(token) {
    if(!token) return null;
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
};

function getUser(email) {
    if (email) {
        let [user, domain] = email.split('@');
        if(!domain) {
            domain = 'sputh.me';
        }
        let user_info = userDB.prepare("SELECT user_id, passwd, domain, dom_alias from users WHERE user_id=?;").all(user);
    
        if(user_info.length) {
            for(let users of user_info) {
                let all_domains = [users.domain, ...users.dom_alias.split(',')];
                if(all_domains.includes(domain)) {
                    return users;
                };
            }
            return null;
        } else {
            return null;
        }
    }
}

function validateUserId(email) {
    if(getUser(email)) {
        return 1;
    } else {
        return 0;
    }
}

module.exports = {
    loginUser, createEncSession, getEncSession, createSession, getSession, validateUserId, getUser, createUser, verifyUser
}