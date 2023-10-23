const Event = require("../schemas/Event");
const jwt = require("jsonwebtoken");

// Create event for specific sport
const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      sportType,
      eventPicture,
      minimumRequiredAmountOfPpl,
      maxCapacity,
      location,
      eventDescription,
      eventDateAndTime,
    } = req.body;
    const creator = req.user;

    const event = await Event.create({
      sportType,
      eventPicture,
      minimumRequiredAmountOfPpl,
      maxCapacity,
      location,
      eventDescription,
      eventDateAndTime,
      creator: userId,
    });

    if (event) {
      res.status(201).json(event);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all events creator
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("creator", "username");
    if (!events) {
      return res.status(200).json({ msg: "No events exist" });
    }
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get one event details by id
const viewOneEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const events = await Event.findOne({ _id: id });
    if (!events) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if user is authorized
    if (event.creator.toString() != userId) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete event" });
    }

    const eventDeleted = await Event.deleteOne({ _id: eventId });

    res.status(200).json({ msg: "Event deleted successfully " });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.module = { createEvent, getAllEvents, viewOneEvent, deleteEvent };
