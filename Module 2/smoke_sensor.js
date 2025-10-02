const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "/forest/smoke";

client.on('connect', () => {
    console.log("Smoke Sensor connected");
    setInterval(() => {
        let smoke = Math.floor(Math.random() * 100); // 0–100%
        client.publish(topic, smoke.toString());
        console.log("Smoke:", smoke);
    }, 2000);
});
