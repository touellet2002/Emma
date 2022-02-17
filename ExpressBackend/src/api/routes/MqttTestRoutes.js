const express = require('express');
const mqttClient = require('../../config/MqttConfig');

// Get Router
const router = express.Router();

// Generate get route
router.get('/on', (req, res) => {
    console.log(mqttClient);
    mqttClient.publish('test', 'on');
    res.send('on');
});

// Generate get route
router.get('/off', (req, res) => {
    mqttClient.publish('test', 'off');
    res.send('off');
});


module.exports = router;