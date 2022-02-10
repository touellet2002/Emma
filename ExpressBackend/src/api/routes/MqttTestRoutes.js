const express = require('express');
const MqttClient = require('../../config/MqttConfig');

// Get Router
const router = express.Router();

// Generate get route
router.get('/on', (req, res) => {
    MqttClient.publish('Test', 'on');
    res.send('on');
});

// Generate get route
router.get('/off', (req, res) => {
    MqttClient.publish('Test', 'off');
    res.send('off');
});


module.exports = router;


