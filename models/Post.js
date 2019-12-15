const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
 user : { type: Schema.Types.ObjectId, ref: "User"},
 body: {type: String, required: true },
 location:{
     lat: {
         type: Number,
         required: true
     },
     lng: {
        type: Number,
        required: true
    }
 }
},
{ timestamps: true })//time review was submitted

const Post = mongoose.model('Post', postSchema)
module.exports = Post