const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const eventSchema = new Schema({
  sportType: {
    type: String,
    required: true,
  },
  eventPicture: {
    type: String,
    default: " ", //need default picture
  },
  usersInterested: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  usersAttending: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  minimumRequiredAmountOfPpl: {
    type: Number,
    default: 10,
  },
  maxCapacity: {
    type: Number,
    default: 22,
  },
  location: {
    type: {
      type: String,
      default: "Point", // need to create geospatial queries
    },
    coordinates: {
      type: [Number],
      default: [13.405, 52.52], // [Longitude, Latitude] for Berlin
    },
    address: {
      type: String,
    },
  },
  hashTags: {
    type: [String],
    default: () => ["#sport_buddies", "#sport", "#meetUp"], //sorry for that
  },
  eventDescription: {
    type: String,
    required: true,
  },
  eventDateAndTime: {
    type: Date,
    required: true,
  },
  organizator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  eventStatus: {
    type: String,
    enum: ["upcoming", "completed"],
    required: true,
  },
});
