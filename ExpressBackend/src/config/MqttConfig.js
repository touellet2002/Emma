const mqtt = require('mqtt');	
const { send } = require('../config/firebase/FirebaseConfig')
const deviceTypeModel = require('../api/models/DeviceTypeModel');

const mqttServerUri = process.env.MQTT_SERVER;
let client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

const mqttClient = {
    publish(topic, message) {
        client.publish(topic, message);
    },
    subscribe(topic) {
        client.subscribe(topic);
    },
    subscribeToDefaultTopics() {
        const {
            deviceModel, deviceTypeModel
        } = require('../api/imports');

        deviceModel.find({}, (err, devices) => {
            if (err) {
                console.log("Error: " + err);
            }
            else {
                devices.forEach(device => {
                    mqttClient.subscribe(device.deviceIdentifier);
                });
            }
        });
    }
};

client.on("message", (topic, message) => {

    console.log(`Message received on topic ${topic}: ${message}`);
    const messageJson = JSON.parse(message);
    if (topic.startsWith("EMMA")) {
        // Serialize the message in JSON
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
                                    // Find device action 
                                    deviceTypeModel.findOne({
                                        _id: device._deviceType
                                    }, (err, deviceType) => {
                                        if(deviceType) {
                                            const action = deviceType.actions.find(action => action.message === messageJson.actionMessage);
                                            console.log(action);
                                            if(action) {
                                                console.log(emma._home.toString() === device._home.toString());
                                                if(emma._home.toString() === device._home.toString()) {
                                                    mqttClient.publish(device.deviceIdentifier + "/CMD", messageJson.actionMessage);
                                                }
                                                if(action.hasNotification) {
                                                    send(device._home, "Action effectuée", `${emma.name} a effectué l'action \"${action.name}\" sur ${device.name}`);
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
        }
    }
    else { 
        // Get device with deviceIdentifier
        const {
            deviceModel
        } = require('../api/imports');

        deviceModel.find({
            deviceIdentifier: topic
        }, (err, devices) => {
            if(devices.length > 0) {
                devices.forEach(device => {
                    // Find device action 
                    deviceTypeModel.findOne({
                        _id: device._deviceType
                    }, (err, deviceType) => {
                        if(deviceType) {
                            const action = deviceType.actions.find(action => action.message === messageJson.action);
                            if(action) {
                                if(action.hasNotification) {
                                    send(device._home, "Action effectuée", `${device.name} a effectué l'action \"${action.name}\"`);
                                }
                            }
                        }
                    });
                });
            }
        });
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