const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true
    },
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Home',
        required: true
    }
}, {
    timestamps: true
});

const HomeUser = mongoose.model('HomeUser', schema);
module.exports = HomeUser;