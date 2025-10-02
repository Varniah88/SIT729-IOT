const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const weather = require('weather-js');
const Sensor = require('./models/sensor');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://varniah26_db_user:46BGEz8da8R65NDQ@cluster0.bccxqhb.mongodb.net/')

// --- CRUD Operations ---

// CREATE: Add a new sensor reading
app.post('/sensors', async (req, res) => {
    const { name, address, temperature, location } = req.body;
    const newSensor = new Sensor({ name, address, temperature, location });
    await newSensor.save();
    res.status(201).send(newSensor);
});

// READ: Get all sensor readings
app.get('/sensors', async (req, res) => {
    const sensors = await Sensor.find();
    res.send(sensors);
});

// READ: Get a specific sensor reading by ID
app.get('/sensors/:id', async (req, res) => {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) return res.status(404).send('Not found');
    res.send(sensor);
});

// UPDATE: Update a sensor reading by ID
app.put('/sensors/:id', async (req, res) => {
    const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sensor) return res.status(404).send('Not found');
    res.send(sensor);
});

// DELETE: Remove a sensor reading by ID
app.delete('/sensors/:id', async (req, res) => {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) return res.status(404).send('Not found');
    res.send(sensor);
});

// GET latest temperature
app.get('/latest', async (req, res) => {
    const latest = await Sensor.findOne().sort({ time: -1 });
    res.send(latest);
});

// GET weather for specific location using weather-js
app.get('/weather/:location', (req, res) => {
    const locationName = req.params.location;
    weather.find({ search: locationName, degreeType: 'C' }, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result[0].current);
    });
});

// Start server
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
