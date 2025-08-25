const sqlite = require("node:sqlite");

const dbDir = "/home/db/sputhmail/"

const accessDB = new sqlite.DatabaseSync(dbDir + "access.db");

accessDB.exec("CREATE TABLE IF NOT EXISTS users(user, token, device, device_id);");

function addUser(email, token) {
    accessDB.prepare("INSERT INTO users (user, token) VALUES (?, ?);").run(email, token);
    return token;
}

module.exports = {
    addUser
}