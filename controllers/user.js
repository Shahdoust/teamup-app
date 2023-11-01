const User = require("../schemas/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { userLocation } = require("../utils/location");
const { calculateAverageRating } = require("../utils/userRating");

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

// edit info
const editUserInfo = async (req, res) => {
  const updatedInfo = req.body;
  const userId = req.params;
  try {
    if (updatedInfo.userInfo) {
      const updatedUser = await User.findByIdAndUpdate(
        { _id: userId.id },
        {
          $set: {
            username: updatedInfo.username,
            "userInfo.location.country": updatedInfo.userInfo.location?.country,
            "userInfo.location.city": updatedInfo.userInfo.location?.city,
            "userInfo.userImage": updatedInfo.userInfo.userImage,
            "userInfo.description": updatedInfo.userInfo.description,
          },
          $push: {
            "userInfo.languagesSpoken": updatedInfo.userInfo.languagesSpoken,
            "userInfo.interestedInSports":
              updatedInfo.userInfo.interestedInSports,
          },
        },
        { new: true }
      );
      await updatedUser.save();
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const createUserCoordinates = async (req, res) => {
  const userId = req.params.id;
  const { city, country } = req.body;
  // console.log("from edit", city, country);
  try {
    const coordinates = await userLocation(city, country);
    // console.log("coords from edit", coordinates);
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

  console.log("signup user", userInfo);
  try {
    const user = await User.signup(userInfo);
    //creating token
    let token;
    if (user.userInfo.userImage) {
      // console.log(user.userInfo.userImage);
      token = createToken(user._id, user.username, user.userInfo.userImage);
    } else {
      token = createToken(user._id, user.username);
    }

    // if (user.userInfo.location) {
    //   createUserCoordinates();
    // }
    // console.log(token);

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

// Submit a user rating
const submitUserRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const raterId = req.user._id;
    const rateDetails = req.body;

    const findUser = await User.findOne({ _id: userId });

    const userInfoRaterAry = findUser.userInfo.userRater;
    const findRaters = async () => {
      if (userInfoRaterAry.length > 0) {
        const match = userInfoRaterAry.find((rater) => {
          if (raterId == rater) {
            return res
              .status(200)
              .json({ msg: "Your rate is already submitted" });
          }
        });
        console.log("match", match);
        if (!match) {
          const user = await User.findByIdAndUpdate(userId, {
            $push: {
              "userInfo.userRater": raterId,
              "userInfo.userRating": rateDetails.userRating,
              // "userInfo.averageRating": rateDetails.userRating[0].rating,
            },
          });
          res.status(200).json({ msg: "Rating submitted successfully" });

          calculateAverageRating(userId);
        }
      } else {
        const user = await User.findByIdAndUpdate(userId, {
          $push: {
            "userInfo.userRater": raterId,
            "userInfo.userRating": rateDetails.userRating,
            // "userInfo.averageRating": rateDetails.userRating[0].rating,
          },
        });
        res.status(200).json({ msg: "Rating submitted successfully" });

        calculateAverageRating(userId);
      }

      //else {
      // const user = await User.findByIdAndUpdate(userId, {
      //   $push: {
      //     "userInfo.userRater": raterId,
      //     "userInfo.userRating": rateDetails.userRating,
      //     "userInfo.averageRating": rateDetails.userRating[0].rating,
      //   },
      // });
      // res.status(200).json({ msg: "Rating submitted successfully" });
      // console.log("user from else", user);
      // calculateAverageRating(userId);
      // }
    };
    findRaters();
  } catch (error) {
    console.error("Error submitting user rating: ", error);
    res.status(500).json({ error: error.message });
  }
};

// upload image
const uploadImage = async (req, res) => {
  const userId = req.params.id;
  try {
    if (req.file && req.file.path) {
      const userImage = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: { "userInfo.userImage": req.file.path },
        }
      );
      return res.status(200).json({ msg: "image successfully saved" });
    } else {
      // console.log(req.file);
      res.status(422).json({ msg: "invalid file" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err });
  }
};
// Delete user
const deleteUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const userDeleted = await User.deleteOne({ _id: userId });
    res.status(200).json({ msg: "Your account successfully deleted" });
  } catch (error) {
    res.status(500).json({ msg: "The user was not successfully deleted" });
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
  submitUserRating,
  uploadImage,
  deleteUser,
};
