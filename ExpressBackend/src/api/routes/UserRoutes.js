const router = require('express').Router();
const model = require('../models/UserModel');
const { encrypt, hash } = require('../plugins/cryptoPlugin');
const { generateAccessToken, authenticateToken } = require('../plugins/JwtPlugin');

router.get('/', (req, res) => {
    model.find({}, (err, users) => {
        if (err) {
            res.send(err);
        } else {
            res.json(users);
        }
    });
});

router.get('/:id', (req, res) => {
    model.findById(req.params.id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    })
})

router.post('/', (req, res) => {
    const user = new model(req.body);

    user.save((err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
})

router.put('/', (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
});

router.delete('/', (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
});

router.post('/register', (req, res) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    model.findOne({ email: userData.email }, (err, user) => {
        if (err) {
            res.send(err);
        } else if (user) {
            res.json({
                message: 'User already exists'
            });
        } else {
            userData.password = hash(userData.password);
            const user = new model(userData);

            user.save((err, user) => {
                if (err) {
                    res.send(err);
                } else {
                    res.json(user);
                }
            });
        }
    });
});

router.post('/auth', (req, res) => {
    model.findOne({
        email: req.body.email
    }, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            if (user) {
                if (user.password === hash(req.body.password)) {
                    res.json({
                        success: true,
                        token: generateAccessToken(user._id)
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Wrong password'
                    });
                }
            } else {
                res.json({
                    success: false,
                    message: 'User not found'
                });
            }
        }
    });
});

module.exports = router;