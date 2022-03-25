const jwt = require('jsonwebtoken');
const roles = require('../constants/Roles');

const generateAccessToken = (text) => {
    // Make a token that never expires
    return jwt.sign({ user: { 
            _id: text._id,
            role: text.role
        }
    }, process.env.TOKEN_SECRET, { });
}  

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (token == null || token == "") return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        next()
    });
}

const authenticateDeveloper = (req, res, next) => {
    const token = req.headers['authorization']
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, info) => {
        if (err) return res.sendStatus(403)

        if (info.user.role !== roles.Developer) return res.sendStatus(403)
        next()
    });
}

module.exports = {
    generateAccessToken,
    authenticateToken,
    authenticateDeveloper
}

