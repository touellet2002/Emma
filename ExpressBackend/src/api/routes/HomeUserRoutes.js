const router = require('express').Router();
const model = require('../models/HomeUserModel');
const {
    authenticateToken,
    authenticateDeveloper
} = require('../plugins/JwtPlugin');

router.get('/homeuser', authenticateDeveloper, (req, res) => {
    model.aggregate([{
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
    model.findById(req.params.id, (err, home) => {
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
    const homeUser = new model(req.body);

    homeUser.save((err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
})

router.put('/homeuser', authenticateToken, (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/homeuser', authenticateToken, (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});


module.exports = router;