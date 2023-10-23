const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  userInfo: {
    userImage: {
      type: String,
    },
    description: {
      type: String,
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
    },
    registrationDate: {
      type: Date,
      default: Date.now, // Automatically set registration date
    },
    userRating: {
      type: Number,
    },
    interestedInSports: [
      {
        type: String,
      },
    ],
    eventsOrganized: [
      {
        type: Schema.Types.ObjectId, //can be retrieved with populate() and exec() methods
        ref: "Event", // look into mongoose ref and populate
      },
    ],
    eventsAttended: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    eventsLiked: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    languagesSpoken: {
      type: [String], //enum with languages
      enum: [
        "English",
        "Spanish",
        "French",
        "German",
        "Chinese",
        "Japanese",
        "Other",
      ],
    },
    customLanguage: {
      type: String,
    },
    //},
  },
});

userSchema.statics.signup = async function (email, password, username) {
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email is already in use");
  }

  if (!email || !password || !username) {
    throw Error("Fill out all the fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Make sure to use at least 8 characters, one upper case letter, a number and a symbol"
    );
  }

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hash, username });

  return user;
};

// static custom login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  // const match = await password.localeCompare(user.password);
  //this need to be changed to like 125 when signin works

  if (!match) {
    throw Error("Incorrect password");
  }
  // if (match !== 0) {
  //   throw Error("Incorrect password"); //this also
  // }

  return user;
};

//update user info in his personal page
userSchema.statics.updateUserInfo = async function (userId, updatedInfo) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw Error("Invalid user id");
  }

  try {
    const updatedUser = await this.findByIdAndUpdate(
      { _id: userId.id },
      { $set: { userInfo: updatedInfo } },
      { new: true }
    );

    if (!updatedUser) {
      throw Error("user is not found");
    }
    // await updatedUser.save();
    return updatedUser;
  } catch (err) {
    throw Error("Failed to update user info");
  }
};

userSchema.statics.resetPassword = async function (
  email,
  password,
  confirm_password
) {
  console.log(email, password, confirm_password);
  const exists = await this.findOne({ email });
  if (!exists) {
    throw Error("Email is not exist");
  }

  if (!email || !password || !confirm_password) {
    throw Error("Fill out the filled");
  }

  if (!validator.isEmail) {
    throw Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Make sure to use at least 8 characters, one upper case letter, a number and a symbol"
    );
  }

  if (password !== confirm_password) {
    throw Error("Password is not matched");
  }

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(confirm_password, salt);
  const user = await this.findOneAndUpdate(
    { email },
    { password: hash },
    { new: true }
  );

  return user;
};

userSchema.methods.getUserEvents = function () {};

//login and edit page

module.exports = mongoose.model("User", userSchema);
