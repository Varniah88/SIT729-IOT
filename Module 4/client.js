const axios = require('axios');

const API_URL = 'http://localhost:3000';

// 1. Add a sensor reading
async function addSensor() {
    const response = await axios.post(`${API_URL}/sensors`, {
        name: 'Office Sensor',
        address: 'Melbourne, AU',
        temperature: Math.floor(Math.random() * 35),
        location: { lat: -37.8136, lon: 144.9631 }
    });
    console.log('Added Sensor:', response.data);
}

// 2. Get all sensors
async function getSensors() {
    const response = await axios.get(`${API_URL}/sensors`);
    console.log('All Sensors:', response.data);
}

// 3. Get latest sensor
async function getLatest() {
    const response = await axios.get(`${API_URL}/latest`);
    console.log('Latest Sensor:', response.data);
}

// 4. Get weather for location
async function getWeather(location) {
    const response = await axios.get(`${API_URL}/weather/${location}`);
    console.log(`Weather in ${location}:`, response.data);
}

// Test functions
(async () => {
    await addSensor();
    await getSensors();
    await getLatest();
    await getWeather('Melbourne, AU');
})();
