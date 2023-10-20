const express = require("express");

const { userSignUp, resetPasswordUser } = require("../controllers/user");

const app = express.Router();
app.post("/signup", userSignUp);
app.post("/reset-password", resetPasswordUser);

module.exports = app;
