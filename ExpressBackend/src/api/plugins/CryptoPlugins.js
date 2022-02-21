const crypto = require('crypto');

module.exports = {
    encrypt = (text) => {
        const algorithm = "aes-256-cbc";

        // generate 16 bytes of random data
        const initVector = crypto.randomBytes(16);

        // secret key generate 32 bytes of random data
        const securitykey = crypto.randomBytes(32);

        // the cipher function
        const cipher = crypto.createCipheriv(algorithm, securitykey, initVector);

        // encrypt the message
        // input encoding
        // output encoding
        return cipher.update(text, "utf-8", "hex");
    }
};