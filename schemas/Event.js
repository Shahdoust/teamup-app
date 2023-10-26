const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const eventSchema = new Schema({
  eventTitle: {
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
      lat: {
        type: Number,
        // required: [true, "Please add latitude"],
      },

      lon: {
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
  hashTags: [
    {
      name: String,
    },
  ],
  eventDescription: {
    type: String,
    required: true,
  },
  eventDateAndTime: {
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // checks if the time is in "HH:MM" format
          return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
        },
        message: 'Event time should be in "HH:MM" format',
      },
    },
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
