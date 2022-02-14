require('dotenv').config();
const express = require('express');
const {
    connect
} = require('./api/database/MongoDB.js');

const app = express();
const port = process.env.PORT || 3000;

const mqttTestRoutes = require('./api/routes/MqttTestRoutes');
const userRoutes = require('./api/routes/UserRoutes');

app.use("/mqtt", mqttTestRoutes);
app.use("/api", userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

connect();

app.listen(3000, () => {
    console.log(`Server is running on port ${port}`);
});