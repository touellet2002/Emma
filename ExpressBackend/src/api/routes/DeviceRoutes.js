const {
    express,
    mongoose,
    deviceModel,
    jwtPlugin,
    jwt,
    validator,
    homeUserModel,
    deviceTypeModel,
    homeModel,
    mqttClient
} = require('../imports');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/user/:id', authenticateToken, (req, res) => {
    deviceModel.aggregate([{
        $match: {
            _owner: mongoose.Types.ObjectId(req.params.id)
        }
    }, {
        $lookup: {
            from: 'users',
            localField: '_owner',
            foreignField: '_id',
            as: '_owner'
        }
    },{
        $lookup: {
            from: 'homes',
            localField: '_home',
            foreignField: '_id',
            as: '_home'
        }
    }], (err, devices) => {
        if (err) {
            res.send(err);
        } else {
            res.send(devices);
        }
    });
});

router.get('/home/:id', authenticateToken, (req, res) => {
    deviceModel.aggregate([{
        $match: {
            _home: mongoose.Types.ObjectId(req.params.id)
        }
    }, {
        $lookup: {
            from: 'users',
            localField: '_owner',
            foreignField: '_id',
            as: '_owner'
        }
    },{
        $lookup: {
            from: 'homes',
            localField: '_home',
            foreignField: '_id',
            as: '_home'
        }
    }], (err, devices) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération des objets connectés"
                }]
            });
        } else {
            res.status(200).json(devices);
        }
    });
});

router.get('/types', authenticateToken, (req, res) => {
    deviceTypeModel.find( {} , (err, types) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération des types d'objets connectés"
                }]
            });
        } else {
            res.status(200).json(types);
        }
    });
});

router.post('/types', authenticateDeveloper, (req, res) => {

    const errorHolder = {
        success: false,
        errors: []
    };

    // Validate the device type
    const typeNameValidator = new validator(req.body.name, "name", "Nom du type d'objet connecté")
        .isAlphaNumericSpaceUTF8()
        .isRequired();

    if (typeNameValidator.errors.length > 0) {
        typeNameValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if(req.body.actions) {
        req.body.actions.forEach(action => {
            const actionNameValidator = new validator(action.name, "action_name", "Nom de l'action")
                .isAlphaNumericSpaceUTF8()
                .isRequired();

            if (actionNameValidator.errors.length > 0) {
                actionNameValidator.errors.forEach(error => {
                    errorHolder.errors.push(error);
                });
            }

            const actionMessageValidator = new validator(action.message, "message", "Message de l'action")
                .isAlphaNumeric()
                .isRequired();

            if (actionMessageValidator.errors.length > 0) {
                actionMessageValidator.errors.forEach(error => {
                    errorHolder.errors.push(error);
                });
            }
            
            if(action.transfer != "Post" && action.transfer != "Get") {
                errorHolder.errors.push({
                    field: "transfer",
                    message: "Le transfert doit être Envoie ou Réception"
                });
            }

            if(action.hasNotification != true && action.hasNotification != false) {
                errorHolder.errors.push({
                    field: "hasNotification",
                    message: "La notification doit être activée ou désactivée"
                });
            }
        });
    }

    if(errorHolder.errors.length > 0) {
        res.status(400).send(errorHolder);
        return;
    }

    const newDeviceType = new deviceTypeModel({
        name: req.body.name,
        actions: req.body.actions
    });

    console.log(req.body.actions);

    newDeviceType.save((err, type) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la création du type d'objet connecté"
                }]
            });
        } else {
            res.status(200).json(type);
        }
    });
});

router.get('/mqtt/:deviceIdentifier/:message', authenticateToken, (req, res) => {
    // Verify if user has access to the device
    const decoded = jwt.decode(req.headers['authorization']);
    deviceModel.findOne({
        deviceIdentifier: req.params.deviceIdentifier
    }, (err, device) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération de l'objet connecté"
                }]
            });
        } else {
            homeUserModel.findOne({
                _user: new mongoose.Types.ObjectId(decoded.user._id),
                _home: new mongoose.Types.ObjectId(device._home)
            }, (err, homeUser) => { 
                if (err) {
                    res.status(400).send({
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de l'envoi de la commande"
                        }]
                    });
                } else {
                    if (homeUser) {
                        // Send the message to the device
                        res.status(200).send({
                            message: "Message envoyé"
                        });
                    } else {
                        // Check if theuser owns the device home
                        homeModel.findOne({
                            _id: new mongoose.Types.ObjectId(device._home),
                            _owner: new mongoose.Types.ObjectId(decoded.user._id)
                        }, (err, home) => {
                            if (err) {
                                res.status(400).send({
                                    errors: [{
                                        field: "_",
                                        message: "Une erreur est survenue lors de l'envoi de la commande"
                                    }]
                                });
                            } else {
                                if (home) {
                                    // Send the message to the device
                                    console.log(req.params.deviceIdentifier + "/CMD");
                                    mqttClient.publish(req.params.deviceIdentifier + "/CMD", req.params.message);
                                    res.status(200).send({
                                        message: "Message envoyé"
                                    });
                                } else {
                                    res.status(400).send({
                                        errors: [{
                                            field: "_",
                                            message: "Vous n'avez pas accès à cet objet connecté"
                                        }]
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
});

router.get('/', authenticateDeveloper, (req, res) => {
    deviceModel.aggregate([{
        $lookup: {
            from: 'users',
            localField: '_owner',
            foreignField: '_id',
            as: '_owner'
        }
    },{
        $lookup: {
            from: 'homes',
            localField: '_home',
            foreignField: '_id',
            as: '_home'
        }
    }], (err, devices) => {
        if (err) {
            res.send(err);
        } else {
            res.send(devices);
        }
    });
});

router.post('/', authenticateToken, (req, res) => {
    const device = new deviceModel(req.body);

    device.save((err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

router.put('/', authenticateToken, (req, res) => {
    deviceModel.findByIdAndUpdate(req.body._id, req.body, (err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    deviceModel.findByIdAndRemove(req.params.id, (err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

module.exports = router;