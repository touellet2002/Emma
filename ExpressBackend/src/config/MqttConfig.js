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
}
catch (err) {
    console.log("MQTT error: " + err);
}


module.exports = mqttClient;