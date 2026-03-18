const sqlite = require("node:sqlite");

const dbDir = "/home/db/sharedvibes/"
const userDB = new sqlite.DatabaseSync(dbDir + "users.db");
const friendsDB = new sqlite.DatabaseSync(dbDir + "friends.db");
const authDB = new sqlite.DatabaseSync(dbDir + "auth.db");

userDB.exec("CREATE TABLE if not exists users(uid, user_id, email, display_name, about, avatar);")
friendsDB.exec("CREATE TABLE if not exists friends(uid, fid, rid, notif);")
authDB.exec("CREATE TABLE if not exists users(uid, user_id, email, token);")

function getUser(email) {
    let rec = userDB.prepare("SELECT * from users where email=?;").get(email);
    return rec;
}

function getAuthUser(token) {
    let rec = authDB.prepare("SELECT * from users where token=?;").get(token);
    return rec;
}

function getRelatedUserList(uid, type = 0) {
    switch(type) {
        case 0: {
            let data = friendsDB.prepare('SELECT fid from friends where uid=?;').all(uid);
            return data;
        }

        case 1: {
            let data = friendsDB.prepare('SELECT rid from friends where uid=?;').all(uid);
            return data;
        }

        case 2: {
            let data = friendsDB.prepare('SELECT uid from friends where rid=?;').all(uid);
            return data;
        }
    }
}

function sendFriendRequest(uid, friend_id, fid, y = true, notif = true) {
    if(y) {
        let friend = getUser(friend_id);
        friendsDB.prepare("INSERT INTO friends(uid, rid) VALUES (?, ?, ?);").run(uid, friend.uid, notif);
    } else {
        friendsDB.prepare("DELETE FROM friends where uid=? AND rid=?").run(uid, fid);
    }
}

function acceptFriendRequest(uid, friend_id, fid, y = true, notif = true) {
    if(y) {
        friendsDB.prepare("INSERT INTO friends(uid, fid) VALUES (?, ?, ?);").run(uid, fid, true);
        friendsDB.prepare("INSERT INTO friends(uid, fid) VALUES (?, ?, ?);").run(fid, uid, notif);
        friendsDB.prepare("DELETE FROM friends where rid=? AND uid=?").run(uid, fid);
    } else {
        friendsDB.prepare("DELETE FROM friends where rid=? AND uid=?").run(uid, fid);
    }
}

function createUserID() {
    return Math.round(Math.random() * 1000000000 + 10000)
}

export {userDB, friendsDB, authDB, getAuthUser, getUser, getRelatedUserList, createUserID, sendFriendRequest, acceptFriendRequest}