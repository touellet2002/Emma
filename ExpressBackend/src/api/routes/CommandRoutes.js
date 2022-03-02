const router = require('express').Router();
const mongoose = require('mongoose');
const model = require('../models/CommandModel');
const {
    authenticateToken,
    authenticateDeveloper
} = require('../plugins/JwtPlugin');

router.get('/command', authenticateDeveloper, (req, res) => {
    model.find({}, (err, commands) => {
        if (err) {
            res.send(err);
            } else {
                res.json(commands);
                }
    });
});

router.get('/command/:id', authenticateDeveloper, (req, res) => {
    model.findById(req.params.id, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

// get all commands for a specific type
router.get('/command/type/:type', authenticateToken, (req, res) => {
    model.find({
        type: req.params.type
    }, (err, commands) => {
        if (err) {
            res.send(err);
        } else {
            res.json(commands);
        }
    }); 
});

router.post('/command', authenticateDeveloper, (req, res) => {
    const command = new model(req.body);

    command.save((err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

router.put('/command', authenticateDeveloper, (req, res) => {
    model.findByIdAndUpdate(req.body._id, req.body, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

router.delete('/command', authenticateDeveloper, (req, res) => {
    model.findByIdAndRemove(req.body._id, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

module.exports = router;