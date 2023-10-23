const express = require("express");

const { viewOneEvent, editEvent } = require("../controllers/event");

const app = express.Router();

const userPermissionToEdit = require("../middlewares/editEventPermission");
const requireAuth = require("../middlewares/requireAuth");

app.get("/:id", viewOneEvent);

app.use("/update-event/:id", requireAuth, userPermissionToEdit);
app.put("/update-event/:id", editEvent);

module.exports = app;
