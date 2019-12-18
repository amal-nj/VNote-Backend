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
      // data.user.password = ""; //remove password
      let modifieddata=[...data]
      for(let i=0;i<modifieddata.length;i++){
        if(modifieddata[i].user){
          modifieddata[i].user.password=""

        }
      }
      // req.app.io.sockets.emit("hello");
      console.log("sending data...",modifieddata)
      res.send(modifieddata);
    })
    .catch(e => {
      console.log("error!",e)
      return res
        .status(400)
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
          req.app.io.sockets.emit("newPost", post.location);

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
          .then((post) => {
            req.app.io.sockets.emit("newPost", post.location);

            res.send("post was updated");
          })
          .catch(err => res.send(err));
    
    }
  );

  router.delete(
    "/delete/:id",
    (req, res) => {
        Post.findByIdAndDelete(req.params.id)
          .then((post) => {
            req.app.io.sockets.emit("newPost", post.location);

            res.send("Post deleted");
          })
          .catch(err => res.send(err));
      
    }
  );

  //get a specfic post
  router.get("/:id", (req, res) => {
    Post.findById(req.params.id).populate('user')
      .then(data => {
        for(let i=0;i<data.length;i++){
          if(data[i].user){
            data[i].user.password=""
  
          }
        }
        res.send(data);
      })
      .catch(e => {
        return res.status(401).json({ error: "error fetching post", msg: e });
      });
  });

 
module.exports = router;
