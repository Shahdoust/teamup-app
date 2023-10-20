const express = require("express");

const { loginUser, editUserInfo } = require("../controllers/user");

const app = express.Router();

app.post("/login", loginUser);
app.put("/edit/:id", editUserInfo);

module.exports = app;
