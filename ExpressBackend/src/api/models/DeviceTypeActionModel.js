const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    transfer: {
        type: String,
        required: true
    },
    hasNotification: {
        type: Boolean,
        required: true
    }
});


const DeviceTypeAction = mongoose.model('DeviceTypeAction', schema);
module.exports = DeviceTypeAction;