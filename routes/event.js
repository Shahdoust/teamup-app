const express = require("express");

const {
  createEvent,
  getAllEvents,
  viewOneEvent,
  deleteEvent,
} = require("../controllers/event");

const app = express.Router();

const checkAuth = require("../middlewares/checkAuth");
app.use(checkAuth);

app.post("/", createEvent);
app.route("/:eventId").get(viewOneEvent).delete(deleteEvent);
app.get("/", getAllEvents);

module.exports = app;
