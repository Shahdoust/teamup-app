const jwt = require("jsonwebtoken");
const User = require("../schemas/User");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({ error: "NOT AUTHORIZED!!!" });
  }

  const token = authorization.split(" ")[1];

  try {
    const id = jwt.verify(token, process.env.SECRET, function (err, user) {
      if (err) {
        return res.status(403).send("Invalid token");
      }
      return user._id;
    });

    req.user = await User.findOne({ _id: id }).select("_id");
    //res.status(200).json(req.user); //here i get id of the user who sends request
    // console.log("user is ", req.user);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ err: "Not permitted" });
  }
};

module.exports = requireAuth;
