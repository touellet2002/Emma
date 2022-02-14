const express = require('express');
const {
    client
} = "../database/MongoDB.js";

const router = express.Router();

router.get('/user', (req, res) => {
    const value = client.db("Amber").collection("Users").find({}).toArray((err, result) => {})
    res.send(value);
});

router.get('/user/:id', (req, res) => {

})

router.post('/user', (req, res) => {

})

router.put('/user', (req, res) => {

});

module.exports = router;