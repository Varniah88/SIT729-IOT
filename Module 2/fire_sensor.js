const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "/forest/fire";

client.on('connect', () => {
    console.log("Fire Sensor connected");
    setInterval(() => {
        let fire = Math.random() > 0.8 ? 1 : 0; // 20% chance fire detected
        client.publish(topic, fire.toString());
        console.log("Fire:", fire);
    }, 2000);
});
