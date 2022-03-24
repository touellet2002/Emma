require("dotenv").config();

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("./credentials.json")),
});

module.exports = {
  send: (id, title, body) => {
    const model = require("../../api/models/HomeModel");
    const home = model.findById(id);

    admin
      .messaging()
      .sendMulticast({
        tokens: [home.notificationkey],
        notification: {
          title: title,
          body: body,
        },
      })
      .then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:");
        if (response.failureCount > 0) {
          console.log(response.responses.map((r) => r.error));
        }
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  },
};
