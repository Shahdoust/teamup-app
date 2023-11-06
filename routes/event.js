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
  getEventsInArea,
  createComment,
  editComment,
  replyComment,
  deleteComment,
  deleteCommentReply,
} = require("../controllers/event");

const app = express.Router();

const checkAuth = require("../middlewares/checkAuth");
app.route("/").post(checkAuth, createEvent).get(getAllEvents);

app.get("/findEvent", getEventsInArea); //find event by city in query
//query example http://localhost:8080/event/findEvent?city=Kyiv

app.route("/:eventId").get(viewOneEvent).delete(checkAuth, deleteEvent);
app.post("/:eventId/comment", requireAuth, createComment);
app.put("/:eventId/comment/:commentId", checkAuth, editComment);
app.delete("/:eventId/comment/:commentId", checkAuth, deleteComment);
app.delete(
  "/:eventId/comment/:commentId/replies/:replyId",
  checkAuth,
  deleteCommentReply
);
app.post("/:eventId/comment/:commentId/replies", checkAuth, replyComment);
app.put("/like", requireAuth, addEventToInterested); //checks if user is authorized and only then can update interestedEvent's array
//query example for above: http://localhost:8080/event/like?id=653679d494ad33f92f3ba768
app.put("/attend", requireAuth, addUserToAttendedEvent); //checks if user is authorized and only then can update attendedEvent's array
//query example for above: http://localhost:8080/event/attend?id=653679d494ad33f92f3ba768

app.use("/update-event/:id", requireAuth, userPermissionToEdit);
app.put("/update-event/:id", editEvent);

module.exports = app;
