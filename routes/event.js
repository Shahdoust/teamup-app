const express = require("express");

const { viewOneEvent } = require("../controllers/event");

const app = express.Router();

app.get("/:id", viewOneEvent);

module.exports = app;
