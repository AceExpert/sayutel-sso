import sqlite from "node:sqlite";

const dbDir = "/home/db/sharedvibes/"
const userDB = new sqlite.DatabaseSync(dbDir + "users.db");
const friendsDB = new sqlite.DatabaseSync(dbDir + "friends.db");
const authDB = new sqlite.DatabaseSync(dbDir + "auth.db");
const channelDB = new sqlite.DatabaseSync(dbDir + "channels.db");
const channelInfo = new sqlite.DatabaseSync(dbDir + "channelinfo.db");
const forumInfo = new sqlite.DatabaseSync(dbDir + "foruminfo.db");
const forumMembers = new sqlite.DatabaseSync(dbDir + "forummembers.db");
const forumThreads = new sqlite.DatabaseSync(dbDir + "forumthreads.db");
const forumMessages = new sqlite.DatabaseSync(dbDir + "forummessages.db");

userDB.exec("CREATE TABLE if not exists users(uid, user_id, email, display_name, about, avatar);")
friendsDB.exec("CREATE TABLE if not exists friends(uid, fid, rid, notif);")
authDB.exec("CREATE TABLE if not exists users(uid, user_id, email, token);")
channelDB.exec("CREATE TABLE if not exists channels(uid, cid);")
channelInfo.exec("CREATE TABLE if not exists channels(cid, channel_type, member_count, max_member, channel_name);")
forumInfo.exec("CREATE TABLE if not exists forums(fid, uid, public, member_count, name, description, tags, invite, icon);")
forumMembers.exec("CREATE TABLE if not exists members(uid, fid);")
forumThreads.exec("CREATE TABLE if not exists threads(tid, fid, name, description, tags, uid, upvotes, downvotes, locked);")
forumMessages.exec("CREATE TABLE if not exists messages(mid, fid, tid, uid, content, reply_id, date, type, reply_degree);")


function getUser(email, userid, uid) {
    let rec = null;

    if(email) {
        rec = userDB.prepare("SELECT * from users where email=?;").get(email);
    } else if(userid) {
        rec = userDB.prepare("SELECT * from users where user_id=?;").get(userid);
    } else {
        rec = userDB.prepare("SELECT * from users where uid=?;").get(uid);
    }
    return rec;
}

function getAuthUser(token) {
    let rec = authDB.prepare("SELECT * from users where token=?;").get(token);
    return rec;
}

function setUser(uid, {name, user_id, about, avatar}) {
    if(!name && !user_id && !about && !avatar) return;
    userDB.prepare(`UPDATE users SET ${name? ("display_name=?" + ((user_id || about)? ', ' : ' ')) : " "}${user_id? "user_id=?" + (about? ', ' : ' ') : " "}${about? "about=? " : " "}WHERE uid=?;`)
        .run(...([name, user_id, about, uid].filter(v => v)));
    return 1
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

function createForum(uid, {name, description, tags = [], invite = null, open = 0}) {
    let fid = createUserID();
    forumInfo.prepare("INSERT into forums (name, description, tags, public, fid, uid, invite) VALUES (?, ?, ?, ?, ?, ?, ?);").run(name, description, JSON.stringify(tags), open, fid, uid, invite);
    forumMembers.prepare("INSERT into members VALUES (?, ?);").run(uid, fid);
    return fid;
}

function joinForum(fid, uid) {
    forumMembers.prepare("INSERT into members VALUES (?, ?);").run(uid, fid);
}

function leaveForum(fid, uid) {
    forumMembers.prepare("DELETE FROM members where uid=? AND fid=?;").run(uid, fid);
}

function getForumMemberIDs(fid) {
    let membs = forumMembers.prepare("SELECT * FROM members where fid=?;").all(fid);
    return membs.map(m => m.uid);
}

function getForum(fids) {
    let forums = [];
    for(let fid of fids) {
        let f = forumInfo.prepare("SELECT * from forums where fid=?;").get(fid);
        f.user_count = getForumMemberIDs(fid).length;
        forums.push(f)
    }
    return forums; 
}

function getForums(uid) {
    let memInfo = forumMembers.prepare("SELECT fid from members where uid=?;").all(uid);
    return getForum(memInfo.map(m => m.fid));
}

function getAllForums(size = 0) {
    let forums = forumInfo.prepare("SELECT * from forums;").all();
    for(let i = 0; i < forums.length; i++) {
        forums[i].user_count = getForumMemberIDs(forums[i].fid).length;
    }
    return forums
}

function createThread({name, description, tags = [], fid, uid, locked = 0}) {
    let tid = createUserID();
    forumThreads.prepare("INSERT INTO threads (tid, fid, uid, name, description, tags, locked) VALUES (?, ?, ?, ?, ?, ?, ?);").run(tid, fid, uid, name, description, JSON.stringify(tags), locked);
    return tid;
}

function sendThreadMessage({mid, tid, fid, uid, content, reply_id = null, date, type = 0, reply_degree = 0}) {
    if(reply_id) {
        let repl_msg = getMessageByID(reply_id);
        reply_degree = repl_msg.reply_degree;
        reply_degree++;
    }
    forumMessages.prepare("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?);").run(mid, fid, tid, uid, content, reply_id, date, type, reply_degree);
    return
}

function getThreads(fid) {
    let threads = forumThreads.prepare("SELECT * from threads WHERE fid=?;").all(fid);
    for(let i = 0; i < threads.length; i++) {
        threads[i].user = getUser(null, null, threads[i].uid);
    }
    return threads
}

function getMessageByID(mid) {
    return forumMessages.prepare("SELECT * from messages WHERE mid=?;").get(mid);
}

function getMessages(tid) {
    let msgs = forumMessages.prepare("SELECT * from messages WHERE tid=?;").all(tid);
    for(let i = 0; i < msgs.length; i++) {
        msgs[i].user = getUser(null, null, msgs[i].uid);
    };
    return msgs;
}

function createChannel(channel_type = 0, channel_name = null, ...uids) {
    if(channel_type === 0) {
        let dm_with = getDMChannelWith(...uids);
        if(dm_with) {
            return dm_with.cid;
        }
    }
    let channelID = createUserID();
    channelInfo.prepare("INSERT INTO channels VALUES (?, ?, ?, ?, ?);").run(channelID, channel_type, uids.length, channel_type === 0? 2 : null, 
        channel_name
    );
    for(let u of uids) {
        channelDB.prepare("INSERT INTO channels VALUES (?, ?);").run(u, channelID);
    }
    return channelID;
}

function getChannel(chan_id) {
    return channelInfo.prepare("SELECT * from channels where cid=?;").get(chan_id);
}

function getDMChannels(user_id) {
    let chans = getChannels(user_id);
    let dm_chans = chans.filter(v => v.channel_type === 0);
    return dm_chans;
}

function getDMChannelWith(user_id, u2_id) {
    let chans = getChannels(user_id);
    let dm_chan = chans.find(v => {
        let mem_ids = v.members.map(mem => mem.uid);
        return v.channel_type === 0 && mem_ids.includes(user_id) && mem_ids.includes(u2_id)
    });
    return dm_chan;
}

function getChannelMembers(channel_id) {
    let users = channelDB.prepare("SELECT * from channels where cid=?;").all(channel_id);
    let user_infos = [];
    for(let u of users) {
        user_infos.push(getUser(null, null, u.uid));
    }

    return user_infos;
}

function getChannels(uid) {
    let chans = channelDB.prepare("SELECT * from channels where uid=?;").all(uid);
    let channel_infos = [];
    for(let ch of chans) {
        let chan_info = getChannel(ch.cid);
        chan_info.members = getChannelMembers(ch.cid);
        channel_infos.push(chan_info);
    }

    return channel_infos;
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

export {userDB, friendsDB, authDB, getAuthUser, getUser, 
        getRelatedUserList, createUserID, sendFriendRequest, acceptFriendRequest, setUser,
        createChannel, getChannels, getChannel, getChannelMembers, getDMChannels,
        getDMChannelWith, createForum, joinForum, leaveForum, getForum, getForums,
        createThread, sendThreadMessage, getThreads, getMessageByID, getMessages,
        getForumMemberIDs, getAllForums
    }