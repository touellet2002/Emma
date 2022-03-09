const {
    express,
    homeUserModel,
    jwtPlugin
} = require('../imports');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/homeuser', authenticateDeveloper, (req, res) => {
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

router.get('/homeuser/:id', authenticateToken, (req, res) => {
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

router.post('/homeuser', authenticateToken, (req, res) => {
    const homeUser = new homeUserModel(req.body);

    homeUser.save((err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
})

router.put('/homeuser', authenticateToken, (req, res) => {
    homeUserModel.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/homeuser', authenticateToken, (req, res) => {
    homeUserModel.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});


module.exports = router;