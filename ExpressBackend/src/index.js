require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const mqttTestRoutes = require('./api/routes/MqttTestRoutes');
const userRoutes = require('./api/routes/UserRoutes');

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://74.210.169.94');

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
}).then((result) => {
    console.log('Connected to Database');
}).catch(err => {
    console.log(err);
});

// App settings
app.use(express.json());

// Map routes
app.use("/mqtt", mqttTestRoutes);
app.use("/api", userRoutes);

// Special routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start app
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Middlewares

// Mqtt events
client.on('connect', () => {
    client.publish('presence', `[${new Date().toISOString()}] Main server is online`);
});

// Mqtt endpoints
app.get('/on', (req, res) => {
    client.publish('1000/CMD', `on`);
    res.send('On command as been sent to the server');
})
app.get('/off', (req, res) => {
    client.publish('1000/CMD', `off`);
    res.send('Off command as been sent to the server');
})