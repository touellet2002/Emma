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
const { response } = require('express');

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
            user.password = undefined;
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
    
    const errorHolder = {
        success: false,
        errors: []
    }

    if(!req.body.name) {
        errorHolder.errors.push({'field': 'name', 'message': 'Le nom est requis'});
    }
    // Regex validation
    else if(!req.body.name.match(/^[a-zA-Z0-9_]{3,20}$/)) {
        errorHolder.errors.push({'field': 'name', 'message': 'Le nom doit contenir entre 3 et 20 caractères'});
    }

    if(!req.body.email) {
        errorHolder.errors.push({'field': 'email', 'message': 'L\'email est requis'});
    }
    // Regex validation
    else if(!req.body.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        errorHolder.errors.push({'field': 'email', 'message': 'L\'email est invalide'});
    }

    if(!req.body.password) {
        errorHolder.errors.push({'field': 'password', 'message': 'Le mot de passe est requis'});
    }
    // Regex validation
    else if(!req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
        errorHolder.errors.push({'field': 'password', 'message': 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial'});
    }

    if(errorHolder.errors.length > 0) {
        res.status(400).send(errorHolder);
        return;
    }

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
            res.status(400).json({
                success: false,
                errors: [{
                    field: 'email',
                    message: 'L\'email est déjà utilisé'
                }]
            });
        } else {
            userData.password = hash(userData.password);
            const user = new model(userData);

            user.save((err, user) => {
                if (err) {
                    res.status(400).send({
                        success: false,
                        errors: [
                            {
                                'field': '_',
                                'message': 'Something went wrong'
                            }
                        ]
                    });
                    return;
                } else {
                    res.status(200).send({
                        success: true,
                        user: user
                    });
                    return;
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
            res.status(400).send({
                errors: [
                    {
                        'field': '_',
                        'message': 'Something went wrong'
                    }
                ]
            });
        } else {
            if (user) {
                if (user.password === hash(req.body.password)) {
                    res.status(200).send({
                        token: generateAccessToken(user),
                    });
                } else {
                    res.status(400).send({
                        errors: [
                            {
                                'field': '_',
                                'message': 'L\'adresse courriel ou/et le mot de passe sont incorrects'
                            }
                        ]
                    });
                }
            } else {
                res.status(400).send({
                    errors: [
                        {
                            'field': '_',
                            'message': 'L\'adresse courriel ou/et le mot de passe sont incorrects'
                        }
                    ]
                });
            }
        }
    });
});

module.exports = router;