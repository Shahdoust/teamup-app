const jwt = require("jsonwebtoken");
const Event = require("../schemas/Event");

// Check token if it is authorized
const checkToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];

  // Verify token
  try {
    const { eventId } = jwt.verify(token, process.env.SECRET);
    req.user = await Event.findOne({ _id: eventId });

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = checkToken;
