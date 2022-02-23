const jwt = require('jsonwebtoken');
const roles = require('../constants/roles');

const generateAccessToken = (text) => {
    return jwt.sign({ user: { 
            _id: text._id,
            role: text.role
        }
    }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}  

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        next()
    });
}

const authenticateDeveloper = (req, res, next) => {
    const token = req.headers['authorization']

    console.log(token)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, info) => {
        console.log(err)

        console.log(info)

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

