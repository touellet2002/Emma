const ws = require('ws');
const jwt = require('jsonwebtoken');
const homeModel = require('../api/models/HomeModel');
const deviceModel = require('../api/models/DeviceModel');
const deviceTypeModel = require('../api/models/DeviceTypeModel');
const mqtt = require('mqtt');


const websocketServer = {
    setup: () => {
        // Create a new websocket server
        const wss = new ws.Server({
            port: process.env.WEB_SOCKET_PORT || 3001
        });

        // On connection
        wss.on('connection', (ws) => {
            // Get the token from the header
            const token = ws.upgradeReq.headers.authorization;
            let userId;
            // Verify the token
            jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    console.log(err);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid token'
                    }));
                    ws.close();
                    return;
                }

                userId = decoded.user._id;
            });

            // Get the home id from the params
            const homeId = ws.upgradeReq.url.split('/')[2];

            // Create a new MQTT client
            const mqttClient = require('../api/imports').mqttClient;
            
            // Get every device of the home
            homeModel.findById(homeId, (err, home) => {
                if (err) {
                    console.log(err);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid home'
                    }));
                    ws.close();
                    return;
                }

                // Check if the user is in the home
                if (home.users.indexOf(userId) === -1) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'You are not in this home'
                    }));
                    ws.close();
                    return;
                }

                if(home._owner !== userId) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'You are not in this home'
                    }));
                    ws.close();
                    return;
                }

                // Subscribe to the home's devices
                deviceModel.find({
                    _home: homeId
                }, (err, devices) => {
                    if (err) {
                        console.log(err);
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Invalid home'
                        }));
                        ws.close();
                        return;
                    }
                    
                    if(devices.length > 0) {

                        const mqttServerUri = process.env.MQTT_SERVER;
                        let client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

                        devices.forEach(device => {
                            client.subscribe(device.deviceIdentifier);
                        });

                        client.on("message", (topic, message) => {
                            console.log(`Message received on topic ${topic}: ${message}`);
                            
                            const messageJson = JSON.parse(message);

                            // find device with topic
                            deviceModel.findOne({
                                deviceIdentifier: topic
                            }, (err, device) => {
                                if (err) {
                                    console.log("Error: " + err);
                                }
                                else {
                                    if(device) {
                                        deviceTypeModel.findById(device._deviceType, (err, deviceType) => {
                                            if (err) {
                                                console.log("Error: " + err);
                                            }
                                            else {
                                                if(deviceType) {
                                                    // Check if action is valid
                                                    if(deviceType.actions.indexOf(messageJson.action) !== -1) {
                                                        //  Get the action
                                                        const action = deviceType.actions.find(action => action.name === messageJson.action);

                                                        // Check if the action transfer is Get
                                                        if(action.transfer === "Get") {
                                                            // Send the data to the client
                                                            ws.send(JSON.stringify({message}));
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    }
};


module.exports = websocketServer;