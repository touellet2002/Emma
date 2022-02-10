require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const mqttTestRoutes = require('./api/routes/MqttTestRoutes');

app.use("/mqtt", mqttTestRoutes);

app.listen(3000, () => { 
    console.log(`Server is running on port ${port}`);
});