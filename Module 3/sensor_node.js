const axios = require('axios');

function generateSensorData() {
    return {
        id: 1,
        name: "seminar_room_sensor",
        location: "Room 101",
        time: Date.now(),
        temperature: Math.floor(Math.random() * (35 - 18) + 18),
        humidity: Math.floor(Math.random() * (70 - 30) + 30),
        occupancy: Math.floor(Math.random() * 30)
    };
}

// Send data every 5 seconds
setInterval(async () => {
    const data = generateSensorData();
    try {
        await axios.post('http://localhost:3000/sensor', data);
        console.log("Sensor data sent:", data);
    } catch (error) {
        console.error(error);
    }
}, 5000);
