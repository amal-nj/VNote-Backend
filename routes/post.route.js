const User = require("../models/User");
const Post = require("../models/Post");

const express = require("express");

// const passport = require("passport");
// const jwt = require("jsonwebtoken");
const router = express.Router();

//get all posts
router.get("/",  (req, res) => {
  Post.find().populate('user')
    .then(data => {
      res.send(data);
    })
    .catch(e => {
      return res
        .status(401)
        .json({ error: "error fetching posts data", msg: e });
    });
});

router.post(
    "/", (req, res) => {
    
        let post = {
            user : req.user,
            body: req.body.body,
            location:{
                lat: req.body.location.lat,
                lng: req.body.location.lng
            }
        };
 
       //instance of data
       let newPost = new Post(post);
        console.log(post)
       // //save the data
       newPost
         .save()
         .then(() => {
           return res.json({ message: "Post created" });
         })
         .catch(e => {
           return res.status(401).json({ error: "error saving post", msg: e });
         });
     
   }
 );
 
 router.put(
    "/edit/:id",
    (req, res) => {
        Post.findByIdAndUpdate(req.params.id, req.body)
          .then(() => {
            res.send("post was updated");
          })
          .catch(err => res.send(err));
    
    }
  );

  router.delete(
    "/delete/:id",
    (req, res) => {
        Post.findByIdAndDelete(req.params.id)
          .then(() => {
            res.send("Post deleted");
          })
          .catch(err => res.send(err));
      
    }
  );

  //get a specfic post
  router.get("/:id", (req, res) => {
    Post.findById(req.params.id).populate('user')
      .then(data => {
        res.send(data);
      })
      .catch(e => {
        return res.status(401).json({ error: "error fetching post", msg: e });
      });
  });

 
module.exports = router;
