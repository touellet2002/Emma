const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role:  {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registrationToken: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', schema);
module.exports = User;