const mqtt = require('mqtt');	

const mqttServerUri = process.env.MQTT_SERVER;
const client = mqtt.connect(`mqtt://${mqttServerUri}:1883`);

const MqttClient = {
    publish(topic, message) {
        client.publish(topic, message);
    },
    subscribe(topic, callback) {
        client.subscribe(topic, callback);
    },
};

module.exports = MqttClient;