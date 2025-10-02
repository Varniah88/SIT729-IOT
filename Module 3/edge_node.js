const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(express.static('public')); // for static JS/CSS

// MongoDB connection
mongoose.connect(
  'mongodb+srv://varniah26_db_user:46BGEz8da8R65NDQ@cluster0.bccxqhb.mongodb.net/',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const SensorLog = require('./models/sensorLog');

// Determine HVAC settings based on sensor data
function determineHVAC(sensorData) {
  let temperature = sensorData.temperature;
  let fanSpeed = 1;
  let alert = "";

  // Occupancy-based energy saving
  if (sensorData.occupancy === 0) {
    temperature = 28; // energy saving
    fanSpeed = 1;
  } else {
    // Temperature control
    if (temperature > 25) fanSpeed = 3;
    else if (temperature > 22) fanSpeed = 2;

    // Humidity adjustment
    if (sensorData.humidity > 60) fanSpeed = Math.max(fanSpeed, 3);

    // Alert for high temperature
    if (temperature > 30) alert = `High temperature detected: ${temperature}°C`;
  }

  return { temperature, fanSpeed, alert };
}

// Receive sensor data
app.post('/sensor', async (req, res) => {
  const sensorData = req.body;
  const { temperature, fanSpeed, alert } = determineHVAC(sensorData);

  try {
    // Send settings to HVAC node
    const hvacResponse = await axios.post('http://localhost:3001/setHVAC', { temperature, fanSpeed });

    // Log to MongoDB
    const logEntry = new SensorLog({
      sensorData,
      hvacSettings: { temperature, fanSpeed },
      hvacResponse: hvacResponse.data,
      alert: alert || "None",
      time: new Date()
    });

    await logEntry.save();
    console.log("Sensor logged:", logEntry);

    // Display alert in console
    if (alert) console.log("ALERT:", alert);

    res.json({ status: "logged", hvac: { temperature, fanSpeed }, alert });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.toString());
  }
});

// Create HTTP server and Socket.io for real-time dashboard
const server = http.createServer(app);
const io = new Server(server);

// Emit new sensor logs to dashboard in real-time
SensorLog.watch().on('change', async data => {
  const log = await SensorLog.findById(data.documentKey._id);
  io.emit('newLog', log);
});

// Dashboard route
app.set('view engine', 'ejs');
app.get('/dashboard', async (req, res) => {
  const logs = await SensorLog.find().sort({ time: 1 }).limit(50);
  res.render('dashboard', { logs });
});

// Start server
server.listen(3000, () => console.log("Edge Node running on port 3000"));
