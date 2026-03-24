const { WebSocketServer } = require("ws");
const sqlite = require("node:sqlite");

let {WSClient} = require("./models");
let {encrypt, decrypt, generateKeys} = require("../../crypt");

let {getAuthUser, getUser, sendFriendRequest, acceptFriendRequest, setUser,
     createChannel, getChannels, getChannelMembers, getChannel
} = require("./db");

let wss = new WebSocketServer({
    port: 4200,
})

let clients = [];

function getClient(uid, user_id) {
    return clients.find(cl => (uid? (cl.uid === uid) : (cl.user_id === user_id)));
}

wss.on("listening", () => {
    console.log("WS listening at port 4200");
})

wss.on("connection", (ws, req) => {
    
    let client = new WSClient({ws: ws});
    clients.push(client);

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
                    //ws auth
                    let auser = getAuthUser(fdata.token);
                    if(auser) {
                        client.email = auser.email;
                        let user = getUser(client.email);
                        client.uid = user.uid;
                        client.user_id = user.user_id;
                        client.user_info = user;
                        ws.send(encrypt(JSON.stringify({'error': 0, 'data': user, 'id': fdata.id}), client.public_key));
                    } else {
                        ws.send(encrypt(JSON.stringify({'error': 1, 'msg': 'unauthorized', 'id': fdata.id}), client.public_key))
                    }
                    break
                }

                case 1: {
                    //send friend request
                    let req_cl = getClient(null, fdata.user_id);
                    let nsent = false;

                    if(req_cl) {
                        req_cl.ws.send(encrypt(JSON.stringify({'type': 1, 'data': client.user_info, 'send': fdata.send}), req_cl.public_key))
                        nsent = true;
                    } else {

                    }

                    sendFriendRequest(client.uid, fdata.user_id, fdata.uid, fdata.send, nsent);
                    
                    break;
                }

                case 2: {
                    //accept friend request
                    let req_cl = getClient(fdata.uid);
                    nsent = false;

                    if(req_cl) {
                        req_cl.ws.send(encrypt(JSON.stringify({'type': 2, 'data': client.user_info, 'accept': fdata.accept}), req_cl.public_key))
                        nsent = true;
                    } else {

                    }

                    acceptFriendRequest(client.uid, fdata.user_id, fdata.uid, fdata.accept, nsent);

                    break;
                }

                case 3: {
                    //send message
                    if(fdata.data.cid) {
                        let members = getChannelMembers(fdata.data.cid);
                        for(let memb of members) {
                            let cl = getClient(memb.uid);
                            if(cl) {
                                cl.ws.send(encrypt(JSON.stringify({'type': 3, 'uid': client.uid, 'user_data': client.user_info, 'data': fdata.data}), cl.public_key))
                            } else {

                            }
                        }
                        
                    } else if (fdata.group_id) {

                    }
                    break;
                }

                case 4: {
                    //set user info
                    setUser(client.uid, fdata.data);
                    client.user_info = getUser(null, null, client.uid);
                    client.user_id = client.user_info.user_id;
                    ws.send(encrypt(JSON.stringify({'error': 0, 'id': fdata.id}), client.public_key));
                    break;
                }

                case 5: {
                    //create channel with user_ids
                    let uids = [];
                    for(let user_id of fdata.user_ids) {
                        uids.push(getUser(null, user_id, null).uid);
                    }
                    let channel_id = createChannel(fdata.channel_type, fdata.channel_name, ...uids);
                    ws.send(encrypt(JSON.stringify({'error': 0, 'channel_id': channel_id, 'id': fdata.id}), client.public_key));
                    break;
                }

                case 6: {
                    //get user info by user_id
                    let users = [];
                    for(let user_id of fdata.user_ids) {
                        users.push(getUser(null, user_id, null));
                    }
                    ws.send(encrypt(JSON.stringify({'error': 0, 'users': users, 'id': fdata.id}), client.public_key));
                    break;
                }

                case 7: {
                    //get channels info
                    ws.send(encrypt(JSON.stringify({'error': 0, 'channels': getChannels(client.uid), 'id': fdata.id}), client.public_key));
                    break;
                }

                case 8: {
                    //get channel members
                    let members = [];
                    for(let ch_id of fdata.channel_ids) {
                        members.push({'cid': ch_id, 'uids': getChannelMembers(ch_id)});
                    }
                    ws.send(encrypt(JSON.stringify({'error': 0, 'members': members, 'id': fdata.id}), client.public_key));
                    break;
                }
            }
        }
    })

    ws.on("error", e => {

    })

    ws.on("close", () => {
        clients = clients.filter(v => v.sessionID !== client.sessionID);
    })

})