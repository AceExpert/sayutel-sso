const sqlite = require("node:sqlite");

const userDB = new sqlite.DatabaseSync("users.db");
const sessionDB = new sqlite.DatabaseSync("sessions.db")

function authUser(user, passwd) {

}

module.exports = {
    authUser
}