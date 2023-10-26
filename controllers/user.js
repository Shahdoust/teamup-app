const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { userLocation } = require("../utils/location");

const createToken = (_id, name, image) => {
  return jwt.sign({ _id, name, image }, process.env.SECRET, {
    expiresIn: "1d",
  });
};
//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userImg = await User.findOne({ email });

    const user = await User.login(email, password);

    //creating token
    let token;
    if (userImg.userInfo.userImage) {
      console.log(userImg.userInfo.userImage);
      token = createToken(user._id, user.username, userImg.userInfo.userImage);
    } else {
      token = createToken(user._id, user.username);
    }

    res.status(200).json({ email, token });
    console.log("success with login");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
//edit or fill up full user info
const editUserInfo = async (req, res) => {
  const updatedUserInformation = req.body;
  const userId = req.params;

  try {
    const updatedUser = await User.updateUserInfo(
      userId,
      updatedUserInformation
    );
    await updatedUser.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const createUserCoordinates = async (req, res) => {
  const userId = req.params.id;
  const { city, country } = req.body;
  console.log("from edit", city, country);
  try {
    const coordinates = await userLocation(city, country);
    console.log("coords from edit", coordinates);
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        "userInfo.location.city": city,
        "userInfo.location.country": country,
        "userInfo.location.LatLng.latitude": coordinates.latitude,
        "userInfo.location.LatLng.longitude": coordinates.longitude,
      },
      { new: true }
    );

    await user.save();
    if (!user) {
      res.status(404).json({ msg: "user not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// Signup user
const userSignUp = async (req, res) => {
  const userInfo = req.body;
  try {
    const user = await User.signup(userInfo);
    //creating token
    let token;
    if (user.userInfo.userImage) {
      console.log(user.userInfo.userImage);
      token = createToken(user._id, user.username, user.userInfo.userImage);
    } else {
      token = createToken(user._id, user.username);
    }
    console.log(token);
    res.status(200).json({ email: userInfo.email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reset password
const resetPasswordUser = async (req, res) => {
  const { email, password: NewPass, confirm_password } = req.body;
  try {
    const user = await User.resetPassword(email, NewPass, confirm_password);
    if (!user) {
      res.status(400).json({ msg: "Error resetting password" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View one profile user
const viewOneUserProfile = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (user) {
      res.status(200).json(user);
    } else {
      return res.status(500).json({ msg: "User id not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View all profile user
const viewAllUserProfile = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  editUserInfo,
  userSignUp,
  resetPasswordUser,
  viewOneUserProfile,
  viewAllUserProfile,
  createUserCoordinates,
};
