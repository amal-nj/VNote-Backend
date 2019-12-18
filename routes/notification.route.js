const User = require("../models/User");
// const Post = require("../models/Post");
const Notification = require("../models/Notification");
const express = require("express");

// const passport = require("passport");
// const jwt = require("jsonwebtoken");
const router = express.Router();

//Expo notfication handling
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

// let savedPushTokens = [];
// const handlePushTokens = message => {
//   let notifications = [];
//   // Create the messages that you want to send to clents
//     // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

//     // Check that all your push tokens appear to be valid Expo push tokens
//     if (!Expo.isExpoPushToken(pushToken)) {
//       console.error(`Push token ${pushToken} is not a valid Expo push token`);
//       continue;
//     }

//     // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
//     notifications.push({
//       to: pushToken,
//       sound: "default",
//       title: "Message received!",
//       body: message,
//       data: { message }
//     });

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
//   let chunks = expo.chunkPushNotifications(notifications);

//   (async () => {
//     // Send the chunks to the Expo push notification service. There are
//     // different strategies you could use. A simple one is to send one chunk at a
//     // time, which nicely spreads the load out over time:
//     for (let chunk of chunks) {
//       try {
//         let receipts = await expo.sendPushNotificationsAsync(chunk);
//         console.log(receipts);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   })();
// };

// const saveToken = token => {
//   if (savedPushTokens.indexOf(token === -1)) {
//     savedPushTokens.push(token);
//   }
// };

router.get("/", (req, res) => {
  res.send("Push Notification router Running");
});
//save user's expo token
router.post("/token/:id", (req, res) => {
  //   saveToken(req.body.token.value);
  User.findByIdAndUpdate(req.params.id, req.body)
    .then(user => {
      console.log(`Received push token, ${req.body.expoToken}`);
      res.send(`Received push token, ${req.body.expoToken}`);
    })
    .catch(e => {
      return res
        .status(401)
        .json({ error: "error updating expo token", msg: e });
    });
});

//get all notificatios of one user
router.get("/:userid", (req, res) => {
  User.findById(req.params.userid)
    .populate({
      path: "notifications",
      populate: { path: "sender" }
    })
    .then(user => {
      console.log(`found user and sending their notfications array`);
      return res.status(200).json({ notifications: user.notifications });
    })
    .catch(e => {
      return res.status(401).json({ error: "cannot find user", msg: e });
    });
});

//route is used to get the user token when a notification is sent to that user
router.get("/UserToken/:username", (req, res) => {
  User.findOne({ username: req.params.username })
    .then(user => {

      console.log(`Receiver push token, ${user.expoToken}`);
      return res.status(200).json({ expoToken: user.expoToken });
    })
    .catch(e => {
      return res.status(401).json({ error: "cannot find user", msg: e });
    });
});

//route is used to get the user id when a notification is sent to that user
router.get("/UserId/:username", (req, res) => {
  User.findOne({ username: req.params.username })
    .then(user => {
      console.log(`User id:, ${user._id}`);
      return res.status(200).json({ id: user._id });
    })
    .catch(e => {
      return res.status(401).json({ error: "cannot find user", msg: e });
    });
});

//post a new notification to the data base
router.post("/note/:id", (req, res) => {
  let notification = new Notification({
    receiver: req.params.id,
    sender: req.user,
    body: req.body.body,
    location: {
      lat: req.body.location.lat,
      lng: req.body.location.lng
    }
  });
  console.log(notification);
  notification
    .save()
    .then(() => {
      User.findById(req.params.id)
        .then(recieverUser => {
          console.log("user", recieverUser);

          recieverUser.notifications.push(notification);
          User.findByIdAndUpdate(req.params.id, recieverUser)
            .then(() => {
              console.log(req.app.io);
              req.app.io.sockets.emit("notification1", recieverUser._id);

              console.log("found user and updated their notfications array");
              return res.status(200).json({
                msg: "found user and updated their notfications array"
              });
            })
            .catch(e => {
              return res
                .status(401)
                .json({ error: "Could not find update user", msg: e });
            });
          // res.send("saved!");
        })
        .catch(e => {
          return res.status(401).json({ error: "Could not find user", msg: e });
        });
    })
    .catch(e => {
      return res
        .status(401)
        .json({ error: "Error saving notification", msg: e });
    });
});

//when user enters the range of the notification
//we user expo server to notify the user
router.get("/notify/:noteid", (req, res) => {
  Notification.findByIdAndUpdate(req.params.noteid, { isReceived: true })
    .populate("receiver")
    .populate("sender")
    .then(note => {
        note.receiver.password = ""; //remove password
        note.sender.password = ""; //remove password

      let savedPushTokens = [];
      let notifications = [];
      // Create the messages that you want to send to clents
      console.log("note:", note);
      // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(note.receiver.expoToken)) {
        console.error(
          `Push token ${note.receiver.expoToken} is not a valid Expo push token`
        );
        return res.status(401).json({
          error: `Push token ${note.receiver.expoToken} is not a valid Expo push token`,
          msg: e
        });
      }
      console.log("before push");

      // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)

      notifications.push({
        to: note.receiver.expoToken,
        sound: "default",
        title: `${note.sender.username} left a note for you`,
        body: note.body,
        data: { note: note.body }
      });
      console.log("after push");

      // The Expo push notification service accepts batches of notifications so
      // that you don't need to send 1000 requests to send 1000 notifications. We
      // recommend you batch your notifications to reduce the number of requests
      // and to compress them (notifications with similar content will get
      // compressed).
      let chunks = expo.chunkPushNotifications(notifications);
      //   console.log('chunks', chunks)
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let receipts = await expo.sendPushNotificationsAsync(chunk);
            console.log("receipts", receipts);
          } catch (error) {
            console.error("error in chunks", error);
          }
        }
      })();
      req.app.io.sockets.emit("notification1", note.receiver._id);

      console.log(`Sending notification to the user`);
      return res.status(200).json({ msg: "notification sent" });
    })
    .catch(e => {
      console.log(e);

      return res
        .status(401)
        .json({ error: "cannot find notification", msg: e });
    });
});

module.exports = router;
