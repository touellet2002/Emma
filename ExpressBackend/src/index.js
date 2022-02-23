require('dotenv').config();
const express = require('express');
const connectToDB = require('./config/DatabaseConfig');
const mqttClient = require('./config/MqttConfig');

const app = express();
const port = process.env.PORT || 3000;

const mqttTestRoutes = require('./api/routes/MqttTestRoutes');
const userRoutes = require('./api/routes/UserRoutes');
const homeRoutes = require('./api/routes/HomeRoutes');

// App settings
app.use(express.json());

// Map routes
app.use("/mqtt", mqttTestRoutes);
app.use("/api/user", userRoutes);
app.use("/api", homeRoutes);

// Special routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start app
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
connectToDB();