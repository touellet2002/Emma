require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectToDB = require('./config/DatabaseConfig');
const mqttClient = require('./config/MqttConfig');
const homeModel = require('./api/models/HomeModel');
const deviceModel = require('./api/models/DeviceModel');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
const ws = require('ws');

const app = express();
const port = process.env.PORT || 3000;

const userRoutes = require('./api/routes/UserRoutes');
const homeRoutes = require('./api/routes/HomeRoutes');
const homeUserRoutes = require('./api/routes/HomeUserRoutes');
const deviceRoutes = require('./api/routes/DeviceRoutes');
const commandRoutes = require('./api/routes/CommandRoutes');

const firebase = require('./config/firebase/FirebaseConfig');

app.use(bodyParser.urlencoded({ extended: false }));
// Log middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// App settings
app.use(express.json());

// Map routes
app.use("/api/user", userRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/homeuser", homeUserRoutes);
app.use("/api/device", deviceRoutes);	
app.use("/api", commandRoutes);

// Special routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start app
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
connectToDB();


const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket, req) => {
    socket.on('message', message => {
        // Get url
        const url = req.url;
        //Get url type
        const urlType = url.split('/')[1];
        // Get the home id
        const homeId = url.split('/')[2];
        // Get the token from the header
        const token = req.headers.authorization;

        // Subscribe to the home's devices
        const mqttServerUri = process.env.MQTT_SERVER;
        let client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

        client.on("message", (topic, message) => {
            console.log("Message received: " + message);
            socket.send(JSON.stringify({
                type: 'message',
                message: message.toString()
            }));
        });
        
        client.on("connect", () => {
            socket.send(JSON.stringify({
                type: 'message',
                message: 'Connected to MQTT server'
            }));
        });

        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log(err);
                socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid token'
                }));
                socket.close();
                return;
            }

            const userId = decoded.user._id;

            if(urlType === 'home') {

                // Check if user is in the home
                homeModel.findById(homeId, (err, home) => {
                    if (err) {
                        console.log(err);
                        socket.send(JSON.stringify({
                            type: 'error',
                            message: 'Invalid home'
                        }));
                        socket.close();
                        return;
                    }
    
                    if(home) {
                        console.log(home)
                        console.log(userId)
                        // Check if the user is in the home
                        if (home._users.indexOf(userId) === -1) {
                            if(home._owner.toString() !== userId) {
                                socket.send(JSON.stringify({
                                    type: 'error',
                                    message: 'You are not the owner of this home'
                                }));
                                socket.close();
                                return;
                            }
                        }
    
                        deviceModel.find({
                            _home: homeId
                        }, (err, devices) => {
                            if (err) {
                                console.log(err);
                                socket.send(JSON.stringify({
                                    type: 'error',
                                    message: 'Invalid home'
                                }));
                                socket.close();
                                return;
                            }
    
                            if(devices.length > 0) {
                                devices.forEach(device => {
                                    console.log(device.deviceIdentifier);
                                    client.subscribe(device.deviceIdentifier);
                                });
                            }
                        });
                    }
                });
            }
            else if(urlType === 'device') {
    
            }
        });
    });
});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, ws => {
        wsServer.emit('connection', ws, request);
    });
});