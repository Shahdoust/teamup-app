const express = require("express");

const {
  loginUser,
  editUserInfo,
  userSignUp,
  resetPasswordUser,
  viewOneUserProfile,
  viewAllUserProfile,
  createUserCoordinates,
  submitUserRating,
} = require("../controllers/user");
const checkToken = require("../middlewares/checkAuth");

const app = express.Router();
app.post("/signup", userSignUp);
app.post("/login", loginUser);
app.post("/login/:id/reset-password", resetPasswordUser);
app.get("/users", viewAllUserProfile);
app.get("/users/:id", viewOneUserProfile);
app.put("/edit/:id", editUserInfo);
app.post("/edit/:id", createUserCoordinates);
const checkAuth = require("../middlewares/checkAuth");
app.post("/users/:userId/rater-user", checkAuth, submitUserRating);
module.exports = app;
