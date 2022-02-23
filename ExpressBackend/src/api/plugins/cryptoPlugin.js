const crypto = require('crypto');

const hash = (text) => {
    return crypto.createHmac('sha256', process.env.SHA256_PRIVATE).update(text).digest('hex');
}

module.exports = {
    hash
};