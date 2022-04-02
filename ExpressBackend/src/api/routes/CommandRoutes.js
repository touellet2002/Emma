const {
    express,
    commandModel,
    jwtPlugin
} = require('../imports');

const router = express.Router();
const {
    authenticateToken,
    authenticateDeveloper
} = jwtPlugin;

router.get('/command', authenticateDeveloper, (req, res) => {
    commandModel.find({}, (err, commands) => {
        if (err) {
            res.send(err);
            } else {
                res.json(commands);
                }
    });
});

router.get('/command/:id', authenticateDeveloper, (req, res) => {
    commandModel.findById(req.params.id, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

// get all commands for a specific type
router.get('/command/type/:type', authenticateToken, (req, res) => {
    commandModel.find({
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
    const command = new commandModel(req.body);

    command.save((err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

router.put('/command', authenticateDeveloper, (req, res) => {
    commandModel.findByIdAndUpdate(req.body._id, req.body, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

router.delete('/command', authenticateDeveloper, (req, res) => {
    commandModel.findByIdAndRemove(req.body._id, (err, command) => {
        if (err) {
            res.send(err);
        } else {
            res.json(command);
        }
    });
});

module.exports = router;