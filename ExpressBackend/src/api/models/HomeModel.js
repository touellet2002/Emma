const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    notificationKey: {
        type: String,
        required: true
    },
    address: {
        type: String,
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

const Home = mongoose.model('Home', schema);
module.exports = Home;
