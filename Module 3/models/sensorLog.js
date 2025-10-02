const mongoose = require('mongoose');

const sensorLogSchema = new mongoose.Schema({
    sensorData: Object,
    hvacSettings: Object,
    hvacResponse: Object,
    alert: String,
    time: Date
});

module.exports = mongoose.model('SensorLog', sensorLogSchema);
