const sqlite = require("node:sqlite");

const dbDir = "/home/db/"

const cytroid_waitlistDB = new sqlite.DatabaseSync(dbDir + "cytroid/waitlist.db");

cytroid_waitlistDB.exec("CREATE TABLE IF NOT EXISTS wishers(email);");

function addWisher(email) {
    if(cytroid_waitlistDB.prepare("SELECT * from wishers WHERE email=?;").get(email)) {
        return 0;
    } else {
        cytroid_waitlistDB.prepare("INSERT INTO wishers VALUES (?);").run(email);
        return 1;
    }
}

module.exports = {
    addWisher
}