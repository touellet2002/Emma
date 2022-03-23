const {
    express,
    homeUserModel,
    homeModel,
    userModel,
    jwtPlugin,
    jwt,
    validator
} = require('../imports');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/', authenticateDeveloper, (req, res) => {
    homeUserModel.aggregate([{
        $lookup: {
            from: 'users',
            localField: '_user',
            foreignField: '_id',
            as: '_user'
        }
    }, {
        $lookup: {
            from: 'homes',
            localField: '_home',
            foreignField: '_id',
            as: '_home'
        }
    }], (err, homes) => {
        if (err) {
            res.send(err);
        } else {
            res.send(homes);
        }
    });
});

router.post('/', authenticateToken, (req, res) => {
    const homeUser = new homeUserModel(req.body);

    homeUser.save((err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
})

router.put('/', authenticateToken, (req, res) => {
    homeUserModel.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/', authenticateToken, (req, res) => {
    homeUserModel.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.post('/add', authenticateToken, (req, res) => {
    // Decode token 
    const decoded = jwt.decode(req.headers.authorization);

    // Validate if email and house are not empty
    const emailValidator = new validator(req.body.email, 'email', 'Email')
        .isEmail()
        .isRequired();

    errorHolder = {
        success: false,
        errors: []
    }

    if (emailValidator.errors.length > 0) {
        emailValidator.errors.forEach(error => {
            errorHolder.errors.push(error);
        });
    }

    if(errorHolder.errors.length > 0) {
        res.status(400).json(errorHolder);
    } 
    else {
        // Find user with email
        userModel.findOne({
            email: req.body.email,
        }, (err, user) => {
            if (err) {

                res.status(400).send({
                    errors: [{
                        field: '_',
                        message: 'Une erreur est survenue lors  de l\'ajout du domicile',
                    }]
                });
            } else {
                // If user is not found
                if(!user) {
                    res.status(400).send({
                        errors: [{
                            field: 'email',
                            message: 'L\'utilisateur n\'existe pas',
                        }]
                    });
                }
                else {
                    // Check if user is already in home
                    homeUserModel.findOne({
                        _user: user._id,
                        _home: req.body.home
                    }, (err, homeUser) => {
                        if (err) {
                            res.status(400).send({
                                errors: [{
                                    field: '_',
                                    message: 'Une erreur est survenue lors  de l\'ajout de l\'utilisateur au domicile',
                                }]
                            });
                        } else {
                            if(homeUser) {
                                res.status(400).send({
                                    errors: [{
                                        field: "email",
                                        message: "Utilisateur déjà dans le domicile"
                                    }]
                                });
                            }
                            else {
                                // Add user to home
                                const homeUser = new homeUserModel();
                                homeUser._user = user._id;
                                homeUser._home = req.body.home;

                                homeUser.save((err, homeUser) => {
                                    if (err) {
                                        res.status(400).send({
                                            errors: [{
                                                field: "_",
                                                message: "Une erreur est survenue lors  de l'ajout de l'utilisateur au domicile",
                                            }]
                                        });
                                    } else {
                                        res.status(200).json(homeUser);
                                    }
                                });
                            }
                        }
                    });
                }   
            }
        });
    }
});

router.get('/:id', authenticateToken, (req, res) => {
    homeUserModel.findById(req.params.id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            user.findById(home._owner, (err, user) => {
                if (err) {
                    res.send(err);
                } else {
                    home._owner = user.name;
                    res.json(home);
                }
            })
        }
    })
})

module.exports = router;