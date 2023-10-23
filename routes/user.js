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
app.post("/login", loginUser);
app.post("/login/:id/reset-password", resetPasswordUser);
app.get("/users", viewAllUserProfile);
app.get("/users/:id", viewOneUserProfile);
app.put("/edit/:id", editUserInfo);

module.exports = app;
