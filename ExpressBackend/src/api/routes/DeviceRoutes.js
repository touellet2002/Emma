const {
    express,
    mongoose,
    deviceModel,
    jwtPlugin,
    jwt,
    cryptoPlugin,
    validator,
    homeUserModel,
    deviceTypeModel,
    homeModel,
} = require('../imports');
const  { send } = require('../../config/firebase/FirebaseConfig');
const mqttClient = require('../../config/MqttConfig');
const { Developer } = require('../constants/Roles');

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
    deviceModel.find({
        _home: mongoose.Types.ObjectId(req.params.id)
    })
    .populate('_owner')
    .populate('_home')
    .populate('_deviceType')
    .exec((err, devices) => {
        if (err) {
            res.send(err);
        } else {
            res.send(devices);
        }
    });
});

router.get('/types', authenticateDeveloper, (req, res) => {
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

router.post('/type', authenticateDeveloper, (req, res) => {
    const errorHolder = {
        success: false,
        errors: []
    };

    // Validate the device type
    const typeNameValidator = new validator(req.body.name, "name", "Nom du type d'objet connecté")
        .isAlphaNumericSpaceUTF8()
        .isRequired();

    const iconValidator = new validator(req.body.icon, "icon", "Icône du type d'objet connecté")
        .isRequired();

    // Check if the name is unique
    deviceTypeModel.findOne({
        name: req.body.name
    }, (err, type) => {
        if (err) {
            res.status(400).send({
                success: false,
                errors : [{
                    field: "_",
                    message: "Une erreur est survenue lors de l'ajout du type d'objet connecté"
                }]
            });
        } else if (type) {
            res.status(400).send({
                success: false,
                errors : [{
                    field: "name",
                    message: "Ce nom est déjà utilisé"
                }]
            });
        }
        else {
            if (typeNameValidator.errors.length > 0) {
                typeNameValidator.errors.forEach(error => {
                    errorHolder.errors.push(error);
                });
            }

            if (iconValidator.errors.length > 0) {
                iconValidator.errors.forEach(error => {
                    errorHolder.errors.push(error);
                });
            }
        
            const jsonActions = JSON.parse(req.body.actions);
            if(jsonActions.length > 0) {
                jsonActions.forEach(action => {
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
                image: req.body.icon,
                actions: jsonActions
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
                    res.sendStatus(200);
                }
            });
        }
    });
});

router.put('/type/:id', authenticateDeveloper, (req, res) => {

    const errorHolder = {
        success: false,
        errors: []
    };

    // Validate the device type
    const typeNameValidator = new validator(req.body.name, "name", "Nom du type d'objet connecté")
        .isAlphaNumericSpaceUTF8()
        .isRequired();

    const iconValidator = new validator(req.body.icon, "icon", "Icône du type d'objet connecté")
        .isRequired();

    // Check if the name is unique
    deviceTypeModel.findOne({
        name: req.body.name
    }, (err, type) => {
        if (err) {
            res.status(400).send({
                success: false,
                errors : [{
                    field: "_",
                    message: "Une erreur est survenue lors de l'ajout du type d'objet connecté"
                }]
            });
        } else if (type) {
            if(type._id != req.params.id) {
                res.status(400).send({
                    success: false,
                    errors : [{
                        field: "name",
                        message: "Ce nom est déjà utilisé"
                    }]
                });
            }
        }

        if (typeNameValidator.errors.length > 0) {
            typeNameValidator.errors.forEach(error => {
                errorHolder.errors.push(error);
            });
        }

        if (iconValidator.errors.length > 0) {
            iconValidator.errors.forEach(error => {
                errorHolder.errors.push(error);
            });
        }
    
        const jsonActions = JSON.parse(req.body.actions);
        if(jsonActions.length > 0) {
            jsonActions.forEach(action => {
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
            image: req.body.icon,
            actions: jsonActions
        });

        deviceTypeModel.findByIdAndUpdate(req.params.id, { 
            name: req.body.name,
            actions: jsonActions
        }, (err, type) => {
            if (err) {
                res.status(400).send({
                    errors: [{  
                        field: "_",
                        message: "Une erreur est survenue lors de la modification du type d'objet connecté"
                    }]
                });
            } else {
                res.status(200).json(type);
            }
        });
    });
});

router.delete("/type/:id", authenticateDeveloper, (req, res) => {

    // Check if devices use this type
    deviceModel.findOne({
        _deviceType: req.params.id
    }, (err, device) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la suppression du type d'objet connecté"
                }]
            });
        } else if (device) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Ce type d'objet connecté est utilisé par un objet connecté"
                }]
            });
        } else {
            deviceTypeModel.findByIdAndRemove(req.params.id, (err, type) => {
                if (err) {
                    res.status(400).send({
                        errors: [{
                            field: "_",
                            message: "Une erreur est survenue lors de la suppression du type d'objet connecté"
                        }]
                    });
                } else {
                    res.sendStatus(200);
                }
            });
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
    deviceModel.find({})
    .populate({
        path: '_owner'
    })
    .populate({
        path: '_home'
    })
    .populate({
        path: '_deviceType'
    })
    .exec((err, devices) => {
        if (err) {
            res.send(err);
        } else {
            res.send(devices);
        }
    });
});

router.post('/', authenticateToken, (req, res) => {
    console.log(req.body)
    // Validate the device model deviceIdentifier and the password
    const deviceIdentifierValidator = new validator(req.body.deviceIdentifier, "deviceIdentifier", "Identifiant de l'objet connecté")
        .isAlphaNumericSlashes()
        .isRequired();

    const passwordValidator = new validator(req.body.password, "password", "Mot de passe de l'objet connecté")
        .isAlphaNumeric()
        .isRequired();

    let errorHolder = {
        success: false,
        errors: []
    }

    if (deviceIdentifierValidator.errors.length > 0) {
        deviceIdentifierValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if (passwordValidator.errors.length > 0) {
        passwordValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if (errorHolder.errors.length > 0) {
        res.status(400).send(errorHolder);
    }
    else {
        const device = new deviceModel({
            deviceIdentifier: req.body.deviceIdentifier,
            password: cryptoPlugin.hash(req.body.password),
        });
    
        // Set device type using the deviceTypeName
        deviceTypeModel.findOne({
            name: req.body.deviceTypeName
        }, (err, type) => {
            if(err) {
                res.status(400).send({
                    errors: [{
                        field: "_",
                        message: "Une erreur est survenue lors de la création de l'objet connecté"
                    }]
                });
            }
            else {
                if(type) {
                    device._deviceType = type._id;
                    device.save((err, device) => {
                        if (err) {
                            res.status(400).send({
                                errors: [{
                                    field: "_",
                                    message: "Une erreur est survenue lors de la création de l'objet connecté"
                                }]
                            });
                        } else {
                            res.send(device);
                        }
                    });
                }
                else {
                    res.status(400).send({
                        errors: [{
                            field: "_",
                            message: "Le type d'objet connecté n'existe pas"
                        }]
                    });
                }
            }
        });
    }
});

router.get('/:id', authenticateDeveloper, (req, res) => {
    deviceModel.findById(req.params.id)
    .populate({
        path: '_owner'
    })
    .populate({
        path: '_home'
    })
    .populate({
        path: '_deviceType'
    })
    .exec((err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.send(device);
        }
    });
});

router.put('/:id', authenticateDeveloper, (req, res) => {
    //Validate the device model deviceIdentifier and the password
    const deviceIdentifierValidator = new validator(req.body.deviceIdentifier, "deviceIdentifier", "Identifiant de l'objet connecté")
        .isAlphaNumericSlashes();

    let passwordValidator = null;
    if(req.body.password) {
        passwordValidator = new validator(req.body.password, "password", "Mot de passe de l'objet connecté")
            .isAlphaNumeric();
    }

    let errorHolder = {
        success: false,
        errors: []
    }

    if (deviceIdentifierValidator.errors.length > 0) {
        deviceIdentifierValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if (passwordValidator) {
        if(passwordValidator.errors.length > 0) {
            passwordValidator.errors.forEach(error => {
                errorHolder.errors.push(error);
            });
        }
    }

    if (errorHolder.errors.length > 0) {
        res.status(400).send(errorHolder);
    }
    else {
        deviceModel.findById(req.params.id, (err, device) => {
            if (err) {
                res.status(400).send({
                    errors: [{
                        field: "_",
                        message: "Une erreur est survenue lors de la récupération de l'objet connecté"
                    }]
                });
            }
            else {
                if(device) {
                    // Update device
                    device.deviceIdentifier = req.body.deviceIdentifier;
                    if(req.body.password) {
                        device.password = cryptoPlugin.hash(req.body.password);
                    }
                    device.save((err, device) => {
                        if (err) {
                            res.status(400).send({
                                errors: [{
                                    field: "_",
                                    message: "Une erreur est survenue lors de la modification de l'objet connecté"
                                }]
                            });
                        } else {
                            res.send(device);
                        }
                    });
                }
                else {
                    res.status(400).send({
                        errors: [{
                            field: "_",
                            message: "L'objet connecté n'existe pas"
                        }]
                    });
                }
            }
        });
    }
});

router.delete('/:id', authenticateDeveloper, (req, res) => {
    deviceModel.findByIdAndRemove(req.params.id, (err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

module.exports = router;