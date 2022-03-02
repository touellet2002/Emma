const router = require('express').Router();
const mongoose = require('mongoose');
const model = require('../models/UserModel');
const {
    encrypt,
    hash
} = require('../plugins/cryptoPlugin');
const {
    generateAccessToken
} = require('../plugins/JwtPlugin');
const roles = require('../constants/roles');

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
    // Delete user
    model.findByIdAndRemove(req.body._id, (err, user) => {
        if (err) {
            res.send(err);
        }
    });

    // Delete houses
    const home = require('../models/homeModel');
    home.find({
        _owner: new mongoose.Types.ObjectId(req.body._id)
    }, (err, homes) => {
        if (err) {
            res.send(err);
        } else {
            homes.forEach(home => {
                home.deleteOne({
                    _id: home._id
                }, (err, log) => {
                    if (err) {
                        res.send(err);
                    }
                });
            });
        }
    });

    // Delete HomeUsers
    const homeUser = require('../models/HomeUserModel');
    homeUser.find({
        _user: new mongoose.Types.ObjectId(req.body._id)
    }, (err, homeUsers) => {
        if (err) {
            res.send(err);
        } else {
            homeUsers.forEach(homeUser => {
                homeUser.deleteOne({
                    _id: homeUser._id
                }, (err, log) => {
                    if (err) {
                        res.send(err);
                    }
                });
            });
        }
    });

    // Delete devices
    const device = require('../models/deviceModel');
    device.find({
        _owner: new mongoose.Types.ObjectId(req.body._id)
    }, (err, devices) => {
        if (err) {
            res.send(err);
        } else {
            devices.forEach(device => {
                device.deleteOne({
                    _id: device._id
                }, (err, log) => {
                    if (err) {
                        res.send(err);
                    }
                });
            });
        }
    });

    res.send({
        status: 'success',
        message: 'User and every related stuff has been deleted'
    });
});

router.post('/register', (req, res) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: roles.Developer
    }

    model.findOne({
        email: userData.email
    }, (err, user) => {
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
                        token: generateAccessToken(user)
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