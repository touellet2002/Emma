const mqtt = require('mqtt');	

const mqttServerUri = process.env.MQTT_SERVER;
let client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

const mqttClient = {
    publish(topic, message) {
        client.publish(topic, message);
    },
    subscribe(topic, callback) {
        client.subscribe(topic, callback);
    }
};

try {
    mqttClient.publish('presence', 'Emma Backend server connected');
    console.log("Connected to MQTT broker");
    loadTopics();
}
catch (err) {
    console.log("MQTT error: " + err);
}

function loadTopics() {
    const {
        deviceModel
    } = require('../api/imports');

    deviceModel.find({}, (err, devices) => {
        if (err) {
            console.log("Error: " + err);
        }
        else {
            devices.forEach(device => {
                mqttClient.subscribe(device.deviceIdentifier, (topic, message) => {
                    console.log(`Received command: ${message}`);
                });
            });
        }
    });
}


module.exports = mqttClient;