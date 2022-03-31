require("dotenv").config();
const fetch = require("node-fetch");

const admin = require("firebase-admin");
const { homeModel } = require("../../api/imports");
admin.initializeApp({
  credential: admin.credential.cert(require("./credentials.json")),
});

module.exports = {
  send: (homeId, title, body) => {
    const model = require("../../api/models/HomeModel");
    const home = model.findById(homeId, (err, home) => {
      if (err) {
        console.log(err);
        return;
      }
      else {
        admin
          .messaging()
          .sendToDeviceGroup(home.notificationKey, {
            notification: {
              title,
              body,
            }
          })
        .then(response => {
            console.log("Successfully sent message:", response);
          })
        .catch(error => {
            console.log("Error sending message:", error);
        });
      }
    });
  },

  sendIndividual: (userId, title, body) => {
    const model = require("../../api/models/UserModel");
    model.findById(userId, (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      else {
        admin
        .messaging()
        .sendToDevice(user.registrationToken, {
          notification: {
            title,
            body,
          }
        })
        .then(response => {
            console.log("Successfully sent message:", response);
          })
        .catch(error => {
            console.log("Error sending message:", error);
        });
      }
    });
  },

  // Create a new notification key
  // The notification key name is the same as the home id
  createNotificationKey: async (homeId, ownerRegistrationId) => {
    // Generate a http request
    const request = require("request");
    const url = "https://fcm.googleapis.com/fcm/notification";

    const options = {
      method: "POST", 
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
        project_id: process.env.FIREBASE_SENDER_ID,
      },
      body: {
        operation: "create",
        notification_key_name: homeId.toString(),
        registration_ids: [ownerRegistrationId],
      },
      json: true,
    };

    // Send the request
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          console.log(body);
          resolve(body.notification_key);
        }
      });
    });
  },
  addRegistrationTokenToDeviceGroup(homeId, notificationKeyName, registrationId) {
    const request = require("request");
    const url = "https://fcm.googleapis.com/fcm/notification";

    homeModel.findById(homeId, (err, home) => {
      if (err) {
        console.log(err);
        return;
      }
      else {

        console.log("Notification key: " + home.notificationKey);
        console.log("Registration id: " + registrationId);
        const options = {
          method: "POST",
          url: url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
            project_id: process.env.FIREBASE_SENDER_ID,
          },
          body: {
            operation: "add",
            notification_key_name: notificationKeyName,
            notification_key: home.notificationKey,
            registration_ids: [registrationId],
          },
          json: true,
        };

        // Send the request
        return new Promise((resolve, reject) => {
          request(options, (error, response, body) => {
            if (error) {
              reject(error);
            } else {
              console.log(body);
              resolve(body.notification_key);
            }
          });
        });
      }
    });
  }
};
