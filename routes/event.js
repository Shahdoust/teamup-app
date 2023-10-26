const express = require("express");
const fetchLocation = require("../utils/location");

const userPermissionToEdit = require("../middlewares/editEventPermission");
const requireAuth = require("../middlewares/requireAuth");

const {
  createEvent,
  getAllEvents,
  viewOneEvent,
  deleteEvent,
  editEvent,
  addEventToInterested,
  addUserToAttendedEvent,
  eventLocation,
} = require("../controllers/event");

const app = express.Router();

const checkAuth = require("../middlewares/checkAuth");
app.route("/").post(checkAuth, createEvent).get(getAllEvents);

app.route("/:eventId").get(viewOneEvent).delete(deleteEvent);

app.put("/like", requireAuth, addEventToInterested); //checks if user is authorized and only then can update interestedEvent's array
//query example for above: http://localhost:8080/event/like?id=653679d494ad33f92f3ba768
app.put("/attend", requireAuth, addUserToAttendedEvent); //checks if user is authorized and only then can update attendedEvent's array
//query example for above: http://localhost:8080/event/attend?id=653679d494ad33f92f3ba768

app.use("/update-event/:id", requireAuth, userPermissionToEdit);
app.put("/update-event/:id", editEvent);

module.exports = app;
