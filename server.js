require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const PORT = process.env.PORT || 5300;
//const PORT = process.env.PORT;

const server = express();

const session = require("express-session");
//jwt and passports
const jwt = require("jsonwebtoken");
const passport = require("passport");
//mongoose connection
const mongooseConnect = require("./config/mongodb");
const cors = require("cors");

server.use(cors());


//allows json to be sent to via request express
server.use(express.json());

//create session for passport
server.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: true
  })
);

server.use(passport.initialize());
server.use(passport.session());
//Expo notfication handling
const {Expo}= require('expo-server-sdk');
const expo = new Expo();

let savedPushTokens = [];
let notifications = [];

const handlePushTokens = (message) => {
  // Create the messages that you want to send to clents
  for (let pushToken of savedPushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'Message received!',
      body: message,
      data: { message },
    })
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
}

const saveToken = (token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
}


server.get('/', (req, res) => {
  res.send('Push Notification Server Running');
});

server.post('/token', (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

server.post('/message', (req, res) => {
  handlePushTokens(req.body.message);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
});

//end of expo notfication handling
//routes
server.use("/api/auth", require("./routes/auth.route"));
server.use(
  "/api/post",
 passport.authenticate("jwt", { session: false }),
  require("./routes/post.route")
);

// server.get("/", (req, res) => {
//   res.send("I'm working!");
// });

//cannot find route
server.use("*", (request, response) => {
  response.status(404).json({ message: "Data not found!" });
});

server.listen(PORT, () => console.log(`connected to ${PORT}`));
