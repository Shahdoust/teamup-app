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
  uploadImage,
} = require("../controllers/user");
const checkToken = require("../middlewares/checkAuth");
const upload = require("../service/upload");
const app = express.Router();
app.post("/signup", userSignUp);
// app.post("/signup", upload.single("picture"), uploadImage);
// app.post("/upload/:id", upload.single("picture"), uploadImage);

app.post("/login", loginUser);
app.post("/login/:id/reset-password", resetPasswordUser);
app.get("/users", viewAllUserProfile);
app.get("/users/:id", viewOneUserProfile);
app.put("/edit/:id", editUserInfo, upload.single("picture"), uploadImage); //upload image and update user
app.post("/edit/:id", createUserCoordinates);
const checkAuth = require("../middlewares/checkAuth");
app.post("/users/:userId/rater-user", checkAuth, submitUserRating);
module.exports = app;
