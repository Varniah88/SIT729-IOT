const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    name: String,
    address: String,
    time: { type: Date, default: Date.now },
    temperature: Number,
    location: {
        lat: Number,
        lon: Number
    }
});

module.exports = mongoose.model('Sensor', sensorSchema);
