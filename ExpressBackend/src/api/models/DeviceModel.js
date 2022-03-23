const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    deviceIdentifier: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'DeviceType'
    },
    _home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home'
    },
    _owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Device", schema);