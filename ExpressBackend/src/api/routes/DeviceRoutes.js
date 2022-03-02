const router = require('express').Router();
const mongoose = require('mongoose');
const model = require('../models/DeviceModel');
const {
    authenticateToken,
    authenticateDeveloper
} = require('../plugins/JwtPlugin');

router.get('/device', authenticateDeveloper, (req, res) => {
    model.aggregate([{
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

router.get('/device/user/:id', authenticateToken, (req, res) => {
    model.aggregate([{
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

router.get('/device/home/:id', authenticateToken, (req, res) => {
    model.aggregate([{
        $match: {
            _home: req.params.id
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

router.get('/device/commands/:id', authenticateToken, (req, res) => {
    // Code here
});

router.post('/device', authenticateToken, (req, res) => {
    const device = new model(req.body);

    device.save((err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

router.put('/device', authenticateToken, (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

router.delete('/device/:id', authenticateToken, (req, res) => {
    model.findByIdAndRemove(req.params.id, (err, device) => {
        if (err) {
            res.send(err);
        } else {
            res.json(device);
        }
    });
});

module.exports = router;