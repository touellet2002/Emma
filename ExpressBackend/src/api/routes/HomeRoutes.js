const {
    express,
    mongoose,
    homeModel,
    userModel,
    jwtPlugin,
    validator, 
    jwt,
    homeUserModel
} = require('../imports');
const { createNotificationKey } = require('../../config/firebase/FirebaseConfig');
const Validator = require('../plugins/ValidatorPlugin');
const { createConnection } = require('mongoose');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/', authenticateDeveloper, (req, res) => {
    homeModel.aggregate([{
        $lookup: {
            from: 'users',
            localField: '_owner',
            foreignField: '_id',
            as: '_owner'
        }
    }], (err, homes) => {
        if (err) {
            res.send(err);
        } else {
            res.send(homes);
        }
    });
});

router.post('/', jwtPlugin.authenticateToken, (req, res) => {
    // Get decoded token
    const decoded= jwt.decode(req.headers['authorization']);

    homeNameValidator = new validator(req.body.name, 'name', "Nom du domicile")
        .isAlphaNumericSpace()
        .isRequired()

    homeAddressValidator = new validator(req.body.address, 'address', "Adresse du domicile")
        .isAlphaNumericSpace()
        .isRequired()

    errorHolder = {
        success: false,
        errors: []
    }

    if (homeNameValidator.errors.length > 0) {
        homeNameValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if (homeAddressValidator.errors.length > 0) {
        homeAddressValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if (errorHolder.errors.length > 0) {
        res.status(400).json(errorHolder);
    }
    else {
        req.body.name = req.body.name.trim();
        // Check home name is unique for a specific owner
        homeModel.findOne({
            name: req.body.name,
            _owner: decoded.user._id
        }, (err, home) => {
            if (err) {
                res.status(400).send({
                    success: false,
                    errors: [{
                        field: "_",
                        message: "Une erreur est survenue lors de la création du domicile"
                    }]
                });
            } else {
                if (home) {
                    res.status(400).send({
                        success: false,
                        errors: [{
                            field: "name",
                            message: "Ce nom de domicile est déjà utilisé"
                        }]
                    });
                }
            }
        });

        // Get home owner registration key
        userModel.findOne({
            _id: decoded.user._id
        }, (err, user) => {
            console.log(err)
            if (err) {
                res.status(400).send({
                    success: false,
                    errors: [{
                        field: "_",
                        message: "Une erreur est survenue lors de la création du domicile"
                    }]
                });
            } else {
                if(user) {
                    // Create registration token and wait for response
                    createNotificationKey(req.body.name + user._id, user.registrationToken)
                    .then(response => {
                        const home = new homeModel({
                            name: req.body.name,
                            address: req.body.address,
                            _owner: decoded.user._id,
                            notificationKey: response
                        });
                    
                        home.save((err, home) => {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    errors: [
                                    {
                                        field: "_",
                                        message: "Une erreur est survenue lors de la création du domicile"
                                    }
                                ]
                            });
                            } else {
                                res.sendStatus(200);
                            }
                        });
                    }).catch(error => {
                        res.status(400).json({
                            success: false,
                            errors: [{
                                field: "_",
                                message: "Une erreur est survenue lors de la création du domicile"
                            }]
                        });
                    });
                }
                else {
                    res.status(400).send({
                        success: false,
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de la création du domicile"
                        }]
                    });
                }
            }
        });
    }
})

router.put('/', authenticateToken, (req, res) => {
    homeModel.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/', authenticateToken, (req, res) => {
    homeModel.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.get('/memberof', authenticateToken, (req, res) => {
    let token = req.headers['authorization'];
    token = jwt.decode(token);
    homeUserModel.find({
        _user: token.user._id
    }, (err, homeUser) => {
        if (err) {
            res.status(400).send({
                field: "_",
                message: "Une erreur est survenue lors de la récupération des domiciles"
            })
        } else {
            let homeIds = homeUser.map(homeUser => homeUser._home.toString()); // Convert every _home to string in order to use it in the next query
            userHomes = []; // Array of all homes (including the ones that the user is only a member of)
            homeModel.find({
                _id: {  $in: homeIds } // Find all homes that the user is a member of
            }, (err, memberHomes) => {
                if (err) {
                    res.status(400).send({
                        field: "_",
                        message: "Une erreur est survenue lors de la récupération des domiciles"
                    });
                } else {
                    if(memberHomes) {
                        userHomes = userHomes.concat(memberHomes); // Add all homes that the user is the owner of to the array
                    }
                }
            });

            homeModel.find({
                _owner: token.user._id // Find all homes that the user is the owner of
            }, (err, ownHomes) => {
                if (err) {
                    res.status(400).send({
                        field: "_",
                        message: "Une erreur est survenue lors de la récupération des domiciles"
                    })
                } else {
                    if(ownHomes) {
                        userHomes = userHomes.concat(ownHomes.map(ownHome => { 
                            // if ownhome is not in userHomes, add it to the array
                            if(!userHomes.find(userHome => userHome._id.toString() === ownHome._id.toString())) {
                                return ownHome;
                            }
                        })); // Add all homes that the user is the owner of to the array
                    }

                    res.status(200).send(userHomes); // Send the array of homes
                }
            })
        }
    });
});

router.get('/owned', authenticateToken, (req, res) => {
    let token = req.headers['authorization'];
    token = jwt.decode(token);
    homeModel.find({
        _owner: token.user._id // Find all homes that the user is the owner of
    }, (err, homes) => {
        if (err) {
            res.status(400).send({
                field: "_",
                message: "Une erreur est survenue lors de la récupération des domiciles"
            })
        } else {
            res.status(200).send(homes); // Send the array of homes
        }
    });
});

router.get('/:id', authenticateToken, (req, res) => {
    homeModel.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(req.params.id)
        }
    }, {
        $lookup: {
            from: 'users',
            localField: '_owner',
            foreignField: '_id',
            as: '_owner'
        }
    }], (err, homes) => {
        if (err) {
            res.send(err);
        } else {
            res.send(homes);
        }
    });
})

module.exports = router;