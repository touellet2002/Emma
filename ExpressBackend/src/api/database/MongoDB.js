require('dotenv').config();
const mongo = require('mongodb');
const uri = process.env.MONGO_URI;

const client = new mongo.MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connect = () => {
    client.connect(err => {
        const collection = client.db("Amber")
        // perform actions on the collection object
        client.close();
    });
}

module.exports = {
    client,
    connect
}