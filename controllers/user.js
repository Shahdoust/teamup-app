const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    //creating token
    // const token = createToken(user._id, user.username);
    const token = createToken(user._id);

    res.status(200).json({ email, token });
    console.log("success with login");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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

// Signup user
const userSignUp = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await User.signup(email, password, username);
    //create token
    const token = createToken(user._id);
    res.status(200).json({ email, token });
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
  const id = req.params.id;

  try {
    const user = User.findOne({ _id: id });
    if (user) {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View all profile user
const viewAllUserProfile = async (req, res) => {
  try {
    const user = User.find();
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
};
