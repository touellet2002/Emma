const router = require('express').Router();
const model = require('../models/homeModel');
const user = require('../models/UserModel');

router.get('/home', (req, res) => {
    model.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: '_owner',
                foreignField: '_id',
                as: '_owner'
            }
        }
    ], (err, homes) => {
        if (err) {
            res.send(err);
        } else {
            res.send(homes);
        }
    });
});

router.get('/home/:id', (req, res) => {
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

router.post('/home', (req, res) => {
    const home = new model(req.body);

    home.save((err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
})

router.put('/home', (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/home', (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

module.exports = router;
module.exports = router;
