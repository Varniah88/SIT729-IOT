const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "/forest/heat1";

client.on('connect', () => {
    console.log("Heat Sensor 1 connected");
    setInterval(() => {
        let heat = Math.floor(Math.random() * 60); // 0–60°C
        client.publish(topic, heat.toString());
        console.log("Heat1:", heat);
    }, 2000);
});
