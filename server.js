require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const PORT = process.env.PORT || 5300;
//const PORT = process.env.PORT;

const server = express();
//socket io setup
var http = require('http').createServer(server);
var io = require('socket.io')(http);
// server.set('socketio', io);
server.io=io

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


//end of socket io setup
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


//routes
server.use("/api/auth", require("./routes/auth.route"));
server.use(
  "/api/post",
     passport.authenticate("jwt", { session: false }),
  require("./routes/post.route")
);
server.use(
  "/api/notifications",
    passport.authenticate("jwt", { session: false }),
  require("./routes/notification.route")
);
server.use(
  "/api/profile",
    passport.authenticate("jwt", { session: false }),
  require("./routes/profile.route")
);
server.get("/", (req, res) => {
  res.send("I'm working!");
});

//cannot find route
server.use("*", (request, response) => {
  response.status(404).json({ message: "Data not found!" });
});

http.listen(PORT, () => console.log(`connected to ${PORT}`));
