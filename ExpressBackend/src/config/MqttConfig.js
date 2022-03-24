const mqtt = require('mqtt');	

const mqttServerUri = process.env.MQTT_SERVER;
let client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

const mqttClient = {
    publish(topic, message) {
        client.publish(topic, message);
    },
    subscribe(topic, callback) {
        client.subscribe(topic, callback);
    },
    subscribeToDefaultTopics() {
        const {
            deviceModel
        } = require('../api/imports');

        deviceModel.find({}, (err, devices) => {
            if (err) {
                console.log("Error: " + err);
            }
            else {
                devices.forEach(device => {
                    console.log(device.deviceIdentifier);
                    mqttClient.subscribe(device.deviceIdentifier);
                });
            }
        });
    }
};

client.on("message", (topic, message) => {

    console.log(`Message received on topic ${topic}: ${message}`);
    if (topic.startsWith("EMMA")) {
        // Serialize the message in JSON
        const messageJson = JSON.parse(message);
        if(messageJson.action === "getDevices") {
            // Get device types
            const {
                deviceModel
            } = require('../api/imports');

            // Find the home of Emma or Paul
            deviceModel.findOne({
                deviceIdentifier: topic
            }, (err, device) => {
                if (err) {
                    console.log("Error: " + err);
                }
                else {
                    if(device) {
                        deviceModel.find({
                            _home: device._home
                        }).populate({
                            path: '_deviceType',
                        }).exec((err, devices) => {
                            if (err) {
                                mqttClient.publish(topic + "/CMD", JSON.stringify({
                                    status: "error",
                                    message: "Une erreur est survenue lors de la récupération des types d'objets connectés"
                                }));
                            }
                            else {
                                mqttClient.publish(topic + "/CMD", JSON.stringify({
                                    subject: "devices",
                                    data: devices
                                }));
                            }
                        });
                    }
                }
            });       
        } 
        else if(messageJson.action === "interactable") {
            // Get device deviceIdentifier
            const {
                deviceModel
            } = require('../api/imports');

            // Find the home of Emma or Paul
            deviceModel.findOne({
                _id: messageJson.deviceId
            }, (err, device) => {
                if (err) {
                    mqttClient.publish(topic + "/CMD", JSON.stringify({
                        status: "error",
                        message: "Une erreur est survenue lors de la récupération de l'objet connecté"
                    }));
                }
                else {
                    if(device) {
                        deviceModel.findOne({
                            deviceIdentifier: topic
                        }, (err, emma) => {
                            if (err) {
                                mqttClient.publish(topic + "/CMD", JSON.stringify({
                                    status: "error",
                                    message: "Une erreur est survenue lors de la récupération de l'objet connecté"
                                }));
                            }
                            else {
                                if(emma) {
                                    console.log(emma._home.toString() === device._home.toString());
                                    if(emma._home.toString() === device._home.toString()) {
                                        mqttClient.publish(device.deviceIdentifier + "/CMD", messageJson.actionMessage);
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});

try {
    mqttClient.publish('presence', 'Emma Backend server connected');
    console.log("Connected to MQTT broker");
    mqttClient.subscribeToDefaultTopics();
}
catch (err) {
    console.log("MQTT error: " + err);
}

module.exports = mqttClient;