require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectToDB = require('./config/DatabaseConfig');
const mqttClient = require('./config/MqttConfig');

const app = express();
const port = process.env.PORT || 3000;

const mqttTestRoutes = require('./api/routes/MqttTestRoutes');
const userRoutes = require('./api/routes/UserRoutes');
const homeRoutes = require('./api/routes/HomeRoutes');
const homeUserRoutes = require('./api/routes/HomeUserRoutes');
const deviceRoutes = require('./api/routes/DeviceRoutes');
const commandRoutes = require('./api/routes/CommandRoutes');

app.use(bodyParser.urlencoded({ extended: false }));
// Log middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// App settings
app.use(express.json());

// Map routes
app.use("/mqtt", mqttTestRoutes);
app.use("/api/user", userRoutes);
app.use("/api", homeRoutes);
app.use("/api", homeUserRoutes);
app.use("/api", deviceRoutes);
app.use("/api", commandRoutes);

// Special routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start app
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
connectToDB();