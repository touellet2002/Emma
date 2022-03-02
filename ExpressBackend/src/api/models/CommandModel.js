const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    command: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    _home: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Command", schema);