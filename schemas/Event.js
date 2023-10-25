const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const eventSchema = new Schema({
  title: {
    type: String,
  },
  sportType: {
    type: [String], //enum with languages
    enum: [
      "Football",
      "Basketball",
      "Swimming",
      "Tennis",
      "Volleyball",
      "Handball",
      "Cricket",
      "Fitness",
      "Yoga",
      "Ski",
      "Cycling",
    ],
    required: true,
  },
  customSport: {
    type: String,
  },

  eventPicture: {
    type: String,
    default: " ", //need default picture
  },

  usersInterested: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  usersAttending: [
    {
      userRef: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      username: {
        type: String,
      },
      userImage: {
        type: String,
      },
      languagesSpoken: {
        type: String,
      },
    },
  ],
  minimumRequiredAmountOfPpl: {
    type: Number,
    default: 10,
  },
  maxCapacity: {
    type: Number,
    default: 22,
  },
  location: {
    LatLng: {
      latitude: {
        type: Number,
        // required: [true, "Please add latitude"],
      },

      longitude: {
        type: Number,
        // required: [true, "Please add longitude"],
      },
    },
    address: {
      city: {
        type: String,
      },
      street: {
        type: String,
      },
      houseNumber: {
        type: Number,
      },
      // type: String,
    },
  },
  hashTags: {
    type: [String],
    default: ["#sport_buddies", "#sport", "#meetUp"], //sorry for that
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

module.exports = mongoose.model("Event", eventSchema);
