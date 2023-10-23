const express = require("express");

const userPermissionToEdit = require("../middlewares/editEventPermission");
const requireAuth = require("../middlewares/requireAuth");

app.get("/:id", viewOneEvent);

const {
  createEvent,
  getAllEvents,
  viewOneEvent,
  deleteEvent,
    editEvent
} = require("../controllers/event");

const app = express.Router();

const checkAuth = require("../middlewares/checkAuth");
app.use(checkAuth);

app.post("/", createEvent);
app.route("/:eventId").get(viewOneEvent).delete(deleteEvent);
app.get("/", getAllEvents);

app.use("/update-event/:id", requireAuth, userPermissionToEdit);
app.put("/update-event/:id", editEvent);

module.exports = app;
