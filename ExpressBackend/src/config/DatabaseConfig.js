const mongoose = require('mongoose');

const connectToDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true
    }).then((result) => {
        console.log('Connected to Database');
    }).catch(err => {
        console.log(err);
    });
}

module.exports = connectToDB;