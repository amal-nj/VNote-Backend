const User = require("../models/User");
const Post = require("../models/Post");

const express = require("express");

// const passport = require("passport");
// const jwt = require("jsonwebtoken");
const router = express.Router();

//get all posts
router.post("/follow/:id", (req, res) => {
 console.log("follow");
  User.findById(req.user._id)
    .then(user => {
      if (!user.following.includes(req.params.id)) {
        console.log("here/s");
        user.following.push(req.params.id);
        User.findByIdAndUpdate(req.user._id, user)
          .then(() => {
            User.findById(req.params.id)
              .then(user2 => {
                if (!user2.followers.includes(req.params.id)) {
                  console.log("here/s");
                    user2.followers.push(req.user._id);
                
                  User.findByIdAndUpdate(req.params.id,{followers: user2.followers})
                    .then(() => {
                        console.log("updated user's following list")
                      return res
                        .status(200)
                        .json({ msg: "updated user's following list" });
                    })
                    .catch(e => {
                      console.log("error!", e);
                      return res
                        .status(400)
                        .json({ error: "error fetching posts data", msg: e });
                    });
                } else {
                  return res
                    .status(200)
                    .json({ msg: "user is already in the following list" });
                }
              })
              .catch(e => {
                console.log("error!", e);
                return res
                  .status(400)
                  .json({ error: "cannot find user", msg: e });
              });
          })
          .catch(e => {
            console.log("error!", e);
            return res
              .status(400)
              .json({ error: "error fetching posts data", msg: e });
          });
      } else {
        return res
          .status(200)
          .json({ msg: "user is already in the following list" });
      }
    })
    .catch(e => {
      console.log("error!", e);
      return res.status(400).json({ error: "cannot find user", msg: e });
    });
});

router.post("/unfollow/:id", (req, res) => {
    console.log("unfollow");
    User.findById(req.user._id)
    .then(user => {
      if (user.following.includes(req.params.id)) {
        console.log("here/s");
        user.following.splice(user.following.indexOf(req.params.id), 1);
        User.findByIdAndUpdate(req.user._id, user)
          .then(() => {
            User.findById(req.params.id)
              .then(user2 => {
                if (user2.followers.includes(req.params.id)) {
                  console.log("here/s");
                  user2.followers.splice(
                    user2.followers.indexOf(req.user._id),
                    1
                  );
                  User.findByIdAndUpdate(req.params.id, {followers: user2.followers})
                    .then(() => {
                      return res
                        .status(200)
                        .json({ msg: "updated user's following list" });
                    })
                    .catch(e => {
                      console.log("error!", e);
                      return res
                        .status(400)
                        .json({ error: "error fetching posts data", msg: e });
                    });
                } else {
                  return res
                    .status(200)
                    .json({ msg: "user is already in the following list" });
                }
              })
              .catch(e => {
                console.log("error!", e);
                return res
                  .status(400)
                  .json({ error: "cannot find user", msg: e });
              });
          })
          .catch(e => {
            console.log("error!", e);
            return res
              .status(400)
              .json({ error: "error fetching posts data", msg: e });
          });
      } else {
        return res
          .status(200)
          .json({ msg: "user is already in  not the following list" });
      }
    })
    .catch(e => {
      console.log("error!", e);
      return res.status(400).json({ error: "cannot find user", msg: e });
    });
});

router.get("/getFollowers/:id", (req, res) => {
  User.findById(req.params.id)
    .populate("followers")
    .populate("following")
    .then(data => {
      console.log(data);
      data.followers.forEach((item, index) => {
        data.followers[index].password = "";
      });
      data.following.forEach((item, index) => {
        data.following[index].password = "";
      });
      return res
        .status(200)
        .json({ followers: data.followers, following: data.following });
    })
    .catch(e => {
      console.log("error!", e);
      return res.status(400).json({ error: "cannot find user", msg: e });
    });
});

module.exports = router;
