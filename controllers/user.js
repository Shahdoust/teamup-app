const User = require("../schemas/User");
const jwt = require("jsonwebtoken");

// const createToken = (_id, name) => {
//   return jwt.sign({ _id, name }, process.env.SECRET, { expiresIn: "1d" });
// };
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

module.exports = { loginUser, editUserInfo };
