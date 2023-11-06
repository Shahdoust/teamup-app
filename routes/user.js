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
  deleteUser,
  editSportsFollowed,
} = require("../controllers/user");
const checkToken = require("../middlewares/checkAuth");
const upload = require("../service/upload");
const app = express.Router();
app.post("/signup", upload.single("picture"), userSignUp);
// app.post("/signup", upload.single("picture"), uploadImage);
// console.log(upload.single());
app.post("/login", loginUser);
app.post("/login/:id/reset-password", resetPasswordUser);
app.get("/users", viewAllUserProfile);
app.get("/users/:id", viewOneUserProfile);
app.put("/edit/sports/:id", editSportsFollowed); //try to delete sports
app.put("/edit/:id", editUserInfo);
app.post("/upload/:id", upload.single("picture"), uploadImage);
//app.put("/edit/:id", upload.single("picture"), uploadImage); //upload image and update user
app.post("/edit/:id", createUserCoordinates);
const checkAuth = require("../middlewares/checkAuth");
app.post("/users/:userId/rater-user", checkAuth, submitUserRating);
app.delete("/users/", checkAuth, deleteUser);
module.exports = app;
