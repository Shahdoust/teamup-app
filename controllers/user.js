const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

// CreateToken
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};

// Signup user
const userSignUp = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);
    //create token
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { email, password: NewPass, confirm_password } = req.body;

  try {
    const user = await User.resetPassword(email, NewPass, confirm_password);
    if (!user) {
      res.status(400).json({ msg: "The password did not reset check again" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { userSignUp, resetPassword };
