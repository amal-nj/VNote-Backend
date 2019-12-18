const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    isReceived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
); //time review was submitted

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
