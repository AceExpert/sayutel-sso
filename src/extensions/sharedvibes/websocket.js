const { WebSocketServer } = require("ws");
const sqlite = require("node:sqlite");

let {WSClient} = require("./models");
let {encrypt, decrypt, generateKeys} = require("../../crypt");

let {getAuthUser, getUser, sendFriendRequest, acceptFriendRequest, setUser} = require("./db");

let wss = new WebSocketServer({
    port: 4200,
})

let clients = [];

function getClient(uid, user_id) {
    return clients.find(cl => uid? (cl.uid === uid) : (cl.user_id === user_id));
}

wss.on("listening", () => {
    console.log("WS listening at port 4200");
})

wss.on("connection", (ws, req) => {
    
    let client = new WSClient({ws: ws});

    ws.on("message", data => {
        if(!client.public_key) {
            let [priv, pkey] = generateKeys()
            client.public_key = data.toString("utf-8");
            client.key = priv;
            ws.send(pkey);
        } else {
            let fdata = JSON.parse(decrypt(data.toString("utf-8"), client.key));
            
            switch(fdata.type) {
                case 0: {
                    let auser = getAuthUser(fdata.token);
                    if(auser) {
                        client.email = auser.email;
                        let user = getUser(client.email);
                        client.uid = user.uid;
                        client.user_id = user.user_id;
                        client.user_info = user;
                        ws.send(encrypt(JSON.stringify({'error': 0, 'data': user, 'id': fdata.id}), client.public_key));
                    } else {
                        ws.send(encrypt(JSON.stringify({'error': 1, 'msg': 'unauthorized', 'id': fdata.id})))
                    }
                    break
                }

                case 1: {
                    let req_cl = getClient(null, fdata.user_id);
                    let nsent = false;

                    if(req_cl) {
                        req_cl.ws.send(encrypt(JSON.stringify({'type': 1, 'data': client.user_info, 'send': fdata.send}), client.public_key))
                        nsent = true;
                    } else {

                    }

                    sendFriendRequest(client.uid, fdata.user_id, fdata.uid, fdata.send, nsent);
                    
                    break;
                }

                case 2: {
                    let req_cl = getClient(fdata.uid);
                    nsent = false;

                    if(req_cl) {
                        req_cl.ws.send(encrypt(JSON.stringify({'type': 2, 'data': client.user_info, 'accept': fdata.accept}), client.public_key))
                        nsent = true;
                    } else {

                    }

                    acceptFriendRequest(client.uid, fdata.user_id, fdata.uid, fdata.accept, nsent);

                    break;
                }

                case 3: {
                    if(fdata.uid) {
                        let cl = getClient(fdata.uid);
                        if(cl) {
                            cl.ws.send(encrypt(JSON.stringify({'type': 3, 'uid': client.uid, 'user_data': client.user_info, 'data': fdata.data}), client.public_key))
                        } else {

                        }
                    } else if (fdata.group_id) {

                    }
                }

                case 4: {
                    setUser(client.uid, fdata.data);
                }
            }
        }
    })

    ws.on("error", e => {

    })

    ws.on("close", () => {

    })

})