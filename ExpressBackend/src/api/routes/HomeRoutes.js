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
const { createNotificationKey, send, sendIndividual } = require('../../config/firebase/FirebaseConfig');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/memberof', authenticateToken, (req, res) => {
    let token = req.headers['authorization'];
    token = jwt.decode(token);

    let homeList = [];

    homeModel.find({
        _users: { $in: [token.user._id] }
    })
    .populate("_users")
    .populate("_owner")
    .exec((err, homes) => {
        if (err) {
            res.status(400).send({
                success: false,
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération des domiciles"
                }]
            });
        } else {
            if(homes.length > 0) {
                homes.forEach(home => {
                    homeList.push(home);
                });
            }

            homeModel.find({
                _owner: token.user._id
            })
            .populate('_users')
            .populate('_owner')
            .exec((err, ownerHomes) => {
                if (err) {
                    res.status(400).send({
                        success: false,
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de la récupération des domiciles"
                        }]
                    });
                } else {
                    if(ownerHomes.length > 0) {
                        ownerHomes.forEach(home => {
                            homeList.push(home);
                        });
                    }

                    res.status(200).json(homeList);
                }
            });
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

router.get('/owned/:id', authenticateToken, (req, res) => {
    let token = req.headers['authorization'];
    token = jwt.decode(token);
    homeModel.findOne({
        _id: req.params.id,
        _owner: token.user._id
    })
    .populate("_users")
    .populate("_owner")
    .exec((err, homes) => {
        if (err) {
            res.status(400).send({
                success: false,
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération des domiciles"
                }]
            });
        } else {
            res.status(200).json(homes);
        }
    });
});

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

router.post('/', jwtPlugin.authenticateToken, (req, res) => {
    //  Decode the token
    const decoded = jwt.decode(req.headers['authorization']);
    const ownerId = decoded.user._id;

    // Validate home name and address
    homeNameValidator = new validator(req.body.name, 'name', "Nom du domicile")
        .isAlphaNumericSpace()
        .isRequired()

    homeAddressValidator = new validator(req.body.address, 'address', "Adresse du domicile")
        .isAlphaNumericSpace()
        .isRequired()

    // Check if emails exist
    userModel.find({}, (err, users) => {
        if(err) {
            res.status(400).send({
                success: false,
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de l'ajout du domicile"
                }]
            })
        }
        else {
            errorHolder = {
                success: false,
                errors: []
            }

            userIds = [];
            userRegistrationToken = [];

            let emailsJson = JSON.parse(req.body.emails);
            emailsJson.forEach(email => {
                if (!users.find(user => user.email === email)) {
                    errorHolder.errors.push({
                        field: "email",
                        message: email
                    });
                }  
                else {
                    userIds.push(users.find(user => user.email === email)._id);
                    userRegistrationToken.push(users.find(user => user.email === email).registrationToken);
                }
            });

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
                const home = new homeModel({
                    name: req.body.name,
                    address: req.body.address,
                    _owner: ownerId,
                    _users: userIds
                });

                // Get _owner registration token
                userModel.findById(ownerId, (err, user) => {
                    if (err) {
                        res.status(400).send({
                            success: false,
                            errors: [{
                                field: "_",
                                message: "Une erreur est survenue lors de l'ajout du domicile"
                            }]
                        })
                    }
                    else {
                        // Create a notification key for the home
                        createNotificationKey(home._id, user.registrationToken).then(key => {
                            home.notificationKey = key;
                            home.save((err, home) => {
                                if (err) {
                                    res.status(400).send({
                                        success: false,
                                        errors: [{
                                            field: "_",
                                            message: "Une erreur est survenue lors de l'ajout du domicile"
                                        }]
                                    })
                                }
                                else {
                                    // Send a firebase push notification to all added users
                                    send(home._id, "Nouveau domicile", "Vous avez été ajouté à un nouveau domicile");
                                    res.sendStatus(200);
                                }
                            });
                        });
                    }
                });
            }
        }
    });
})

router.put('/:id', authenticateToken, (req, res) => {
    const homeId = req.params.id;
    const decoded = jwt.decode(req.headers['authorization']);

    // Check if user is home owner
    homeModel.findOne({
        _id: homeId,
        _owner: decoded.user._id
    }, (err, home) => {
        if(err) {
            res.status(400).send({
                success: false,
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la modification du domicile"
                }]
            });
        }
        else {
            // Validate home name and home address
            homeNameValidator = new validator(req.body.name, 'name', "Nom du domicile")
                .isAlphaNumericSpace()
                .isRequired()

            homeAddressValidator = new validator(req.body.address, 'address', "Adresse du domicile")
                .isAlphaNumericSpace()
                .isRequired()

            // Check if emails exist 
            userModel.find({}, (err, users) => {
                if (err) {
                    res.status(400).send({
                        success: false,
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de la modification du domicile"
                        }]
                    });
                } else {
                    errorHolder = {
                        success: false,
                        errors: []
                    }

                    userIds = [];
                    registrationTokens = [];

                    let emailsJson = JSON.parse(req.body.emails);
                    emailsJson.forEach(email => {
                        if (!users.find(user => user.email === email)) {
                            errorHolder.errors.push({
                                field: "email",
                                message: email
                            });
                        } 
                        else {
                            userIds.push(users.find(user => user.email === email)._id);
                            registrationTokens.push(users.find(user => user.email === email).registrationToken);
                        }
                    });

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
                        // Find new users
                        const newUsers = userIds.filter(userId => !home._users.includes(userId));

                        // Save home
                        home.name = req.body.name;
                        home.address = req.body.address;
                        home._users = userIds;

                        home.save((err, home) => {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    errors: [
                                    {
                                        field: "_",
                                        message: "Une erreur est survenue lors de la modification du domicile"
                                    }
                                ]
                            });
                            } else {
                                newUsers.forEach(userId => {
                                    // Send a firebase push notification to all added users
                                    sendIndividual(userId, "Nouveau domicile", "Vous avez été ajouté à un nouveau domicile");
                                });
                                res.sendStatus(200);
                            }
                        });
                    }
                }
            });
        }
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    const homeId = req.params.id;
    const decoded = jwt.decode(req.headers['authorization']);

    // Check if user is home owner
    homeModel.findOne({
        _id: homeId,
        _owner: decoded.user._id
    }, (err, home) => {
        if(err) {
            res.status(400).send({
                success: false,
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la suppression du domicile"
                }]
            });
        }
        else {
            // Remove home
            home.remove((err, home) => {
                if (err) {
                    res.status(400).send({
                        success: false,
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de la suppression du domicile"
                        }]
                    });
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});



module.exports = router;