const mongoose = require("mongoose");

const Event = require("../schemas/Event");
const jwt = require("jsonwebtoken");

// Get one event by id
const viewOneEvent = async (req, res) => {
  const id = req.params.id;
  try {
    const event = await Event.findOne({ _id: id });

    if (event) {
      res.status(200).json(event);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Edit event
const editEvent = async (req, res) => {
  const updatedEventInformation = req.body;
  const eventId = req.params.id;
  //   console.log("hello from controller", eventId);
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updatedEventInformation },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "event not found" });
    }
    await updatedEvent.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ err: "failed to update event :(" });
  }
};

module.exports = {
  viewOneEvent,
  editEvent,
};
