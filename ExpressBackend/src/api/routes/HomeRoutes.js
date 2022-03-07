const router = require('express').Router();
const mongoose = require('mongoose');
const model = require('../models/homeModel');
const {
    authenticateToken,
    authenticateDeveloper
} = require('../plugins/JwtPlugin');

router.get('/home', authenticateDeveloper, (req, res) => {
    model.aggregate([{
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

router.get('/home/:id', authenticateToken, (req, res) => {

    model.aggregate([{
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

router.put('/home', authenticateToken, (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

router.delete('/home', authenticateToken, (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, home) => {
        if (err) {
            res.send(err);
        } else {
            res.json(home);
        }
    });
});

module.exports = router;