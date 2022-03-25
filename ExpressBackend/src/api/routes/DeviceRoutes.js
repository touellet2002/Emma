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
} = require('../imports');
const  { send } = require('../../config/firebase/FirebaseConfig');
const mqttClient = require('../../config/MqttConfig')

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

router.get('/mqtt/:deviceId/:actionId', authenticateToken, (req, res) => {
    const decodedJwt = jwt.decode(req.headers['authorization']);
    // Verify if user has access to the device
    deviceModel.findOne({
        _id: req.params.deviceId,
    }, (err, device) => {
        // If error, send 400
        if(err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de l'envoie de la commande"
                }]
            });
        }
        else {
            // Verify if there is an existing device
            if(device) {

                // If the user is the owner of the home, he has permission to send a command to the device
                homeModel.findOne({
                    _id: device._home,
                    _owner: decodedJwt.user._id
                }, (err, home) => {
                    if(err) {
                        res.status(400).send({
                            errors: [{
                                field: "_",
                                message: "Une erreur est survenue lors de l'envoie de la commande"
                            }]
                        });
                    }
                    else {
                        if(home) {
                            // Find the action with the device type
                            deviceTypeModel.findOne({
                                _id: device._deviceType,
                            }, (err, type) => {
                                if(err) {
                                    res.status(400).send({
                                        errors: [{
                                            field: "_",
                                            message: "Une erreur est survenue lors de l'envoie de la commande"
                                        }]
                                    });
                                }
                                else {
                                    if(type) {
                                        const action = type.actions[req.params.actionId];
                                        if(action && action.transfer === "Post") {
                                            console.log(device.deviceIdentifier + "/CMD", action.message);
                                            mqttClient.publish(device.deviceIdentifier + '/CMD', action.message);
                                            if(action.hasNotification) {
                                                send(device._home, "Action envoyée", "L'action \"" + action.name + "\" a été envoyée à l'objet connecté " + device.name);
                                            }
                                            res.sendStatus(200);
                                        }   
                                        else {
                                            res.status(400).send({
                                                errors: [{
                                                    field: "_",
                                                    message: "Action impossible"
                                                }]
                                            });
                                        }
                                    }
                                    else {
                                        res.status(400).send({
                                            errors: [{
                                                field: "_",
                                                message: "Une erreur est survenue lors de l'envoie de la commande"
                                            }]
                                        });
                                    }
                                }
                            });
                        }
                        else { 
                            // If user is in the device home, the user has permission to send a command
                            homeUserModel.findOne({
                                _home: device._home,
                                _user: decodedJwt.user._id,
                            }, (err, homeUser) => {
                                if (err) {
                                    res.status(400).send({
                                        errors: [{
                                            field: "_",
                                            message: "Une erreur est survenue lors de l'envoie de la commande"
                                        }]
                                    });
                                }
                                else {
                                    if(homeUser) {
                                        // Find the action with the device type
                                        deviceTypeModel.findOne({
                                            _id: device._deviceType,
                                        }, (err, type) => {
                                            if(err) {
                                                res.status(400).send({
                                                    errors: [{
                                                        field: "_",
                                                        message: "Une erreur est survenue lors de l'envoie de la commande"
                                                    }]
                                                });
                                            }
                                            else {
                                                if(type) {
                                                    const action = type.actions[req.params.actionId];
                                                    if(action && action.transfer == "Post") {
                                                        console.log(device.deviceIdentifier + '/CMD');
                                                        mqttClient.publish(device.deviceIdentifier + '/CMD', action.message);
                                                        if(action.hasNotification) {
                                                            send(device._home, "Action envoyée", "L'action \"" + action.name + "\" a été envoyée à l'objet connecté " + device.name);
                                                        }
                                                        res.sendStatus(200);
                                                    }   
                                                    else {
                                                        res.status(400).send({
                                                            errors: [{
                                                                field: "_",
                                                                message: "Action impossible"
                                                            }]
                                                        });
                                                    }
                                                }
                                                else {
                                                    res.status(400).send({
                                                        errors: [{
                                                            field: "_",
                                                            message: "Une erreur est survenue lors de l'envoie de la commande"
                                                        }]
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    else {
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