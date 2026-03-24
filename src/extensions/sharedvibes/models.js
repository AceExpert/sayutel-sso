class WSClient {

    constructor({is_auth = false, user_id = null, uid = null, email = null, ws = null, info = {}}) {
        this.is_auth = is_auth;
        this.user_id = user_id;
        this.uid = uid;
        this.email = email;
        this.ws = ws;
        this.key = null;
        this.public_key = null;
        this.info = info;
        this.user_info = {};
        this.sessionID = Math.round(Math.random() * 1000000)
    }
}

export {WSClient}