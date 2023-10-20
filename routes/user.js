const express = require("express");

const {
  loginUser,
  editUserInfo,
  userSignUp,
  resetPasswordUser,
  viewOneUserProfile,
  viewAllUserProfile,
} = require("../controllers/user");

const app = express.Router();
app.post("/signup", userSignUp);
app.post("/users/:id/reset-password", resetPasswordUser);
app.get("/users", viewAllUserProfile);
app.get("/users/:id", viewOneUserProfile);
app.post("/login", loginUser);
app.put("/edit/:id", editUserInfo);

module.exports = app;
