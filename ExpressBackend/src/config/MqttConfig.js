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

module.exports = mqttClient;