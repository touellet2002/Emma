const router = require('express').Router();
const model = require('../models/UserModel');

router.get('/user', (req, res) => {
    model.find({}, (err, users) => {
        if (err) {
            res.send(err);
        } else {
            res.json(users);
        }
    });
});

router.get('/user/:id', (req, res) => {
    model.findById(req.params.id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    })
})

router.post('/user', (req, res) => {
    const user = new model(req.body);

    user.save((err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
})

router.put('/user', (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
});

router.delete('/user', (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.json(user);
        }
    });
});

module.exports = router;