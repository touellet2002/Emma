const {
    express,
    mongoose,
    deviceModel,
    jwtPlugin,
    validator,
    homeUserModel
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
    deviceModel.distinct('type', (err, types) => {
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
    // Validate the device type
    const typeNameValidator = new validator(req.body.name, "name", "Nom du type d'objet connecté")
        .isAlphaNumericSpace()
        .isRequired();

    req.body.actions.forEach(action => {
        const actionNameValidator = new validator(action.name, "name", "Nom de l'action")
            .isAlphaNumericSpace()
            .isRequired();

        const actionDescriptionValidator = new validator(action.description, "description", "Description de l'action")
            .isAlphaNumericSpace()
            .isRequired();
        
    });

});

router.post('/mqtt/:id/:message', authenticateToken, (req, res) => {
    // Verify if user has access to the device
    const decoded = jwt.decode(req.headers['authorization']);
    console.log(decoded);
    deviceModel.findById(req.params.id, (err, device) => {
        if (err) {
            res.status(400).send({
                errors: [{
                    field: "_",
                    message: "Une erreur est survenue lors de la récupération de l'objet connecté"
                }]
            });
        } else {
            homeUserModel.find({
                _user: new mongoose.Types.ObjectId(decoded._user._id),
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
                    if (homeUser.length === 0) {
                        res.status(400).send({
                            errors: [{
                                field: "_",
                                message: "Vous n'avez pas accès à cet objet connecté"
                            }]
                        });
                    } else {
                        // Send the message to the device
                        device.mqtt.publish(device.deviceIdentifier + '/CMD', req.params.message);
                        res.status(200).send({
                            message: "Commande envoyée"
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