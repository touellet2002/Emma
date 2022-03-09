module.exports = {
    express: require('express'),
    mongoose: require('mongoose'),
    userModel: require('./models/userModel'),
    commandModel: require('./models/commandModel'),
    deviceModel: require('./models/deviceModel'),
    homeModel: require('./models/homeModel'),
    homeUserModel: require('./models/homeUserModel'),
    cryptoPlugin: require('./plugins/cryptoPlugin'),
    jwtPlugin: require('./plugins/jwtPlugin'),
    deviceType: require('./constants/deviceTypes'),
    roles: require('./constants/roles'),
    jwt: require('jsonwebtoken')
};