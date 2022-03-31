const mongoose = require('mongoose');
const DeviceTypeAction = require('./DeviceTypeActionModel');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    actions: [
        {
            type: Object,
        }
    ]
});


const DeviceType = mongoose.model('DeviceType', schema);
module.exports = DeviceType;