const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function genToken(len = 256) {
    let token = '';
    
    for(let i = 0; i < len; i++) {
        token += chars[Math.round(Math.random() * chars.length)]
    }
    return token
}

module.exports = {
    genToken
}