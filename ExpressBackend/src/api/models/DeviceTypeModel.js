const mongoose = require('mongoose');
const DeviceTypeAction = require('./DeviceTypeActionModel');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    actions: [DeviceTypeAction]
});


const DeviceType = mongoose.model('DeviceType', schema);
module.exports = DeviceType;