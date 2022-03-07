const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    _home: {
        type: mongoose.Schema.Types.ObjectId,
    },
    _owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Device", schema);