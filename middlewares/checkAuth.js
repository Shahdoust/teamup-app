const jwt = require("jsonwebtoken");
const User = require("../schemas/User");

// Check token if it is authorized
const checkToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];

  // Verify token
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id: _id }).select("_id");
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = checkToken;
