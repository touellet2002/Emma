const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});


const DeviceTypeAction = mongoose.model('DeviceTypeAction', schema);
module.exports = DeviceTypeAction;