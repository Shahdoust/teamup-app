const express = require("express");

const {
  createEvent,
  getAllEvents,
  viewOneEvent,
  deleteEvent,
} = require("../controllers/event");

const app = express.Router();

app.post("/", createEvent);
app.route("/eventId").get(viewOneEvent).delete(deleteEvent);
app.get("/", getAllEvents);

module.exports = app;
