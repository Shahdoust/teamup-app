const Event = require("../schemas/Event");
const User = require("../schemas/User");

const axios = require("axios");

const { fetchLocationEvent } = require("../utils/location");


// Create event for specific sport
const createEvent = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const {
      sportType,
      usersInterested,
      usersAttending,
      eventPicture,
      minimumRequiredAmountOfPpl,
      maxCapacity,
      location,
      hashTags,
      eventDescription,
      eventDateAndTime,
      organizator,
      eventStatus,
    } = req.body;

    const event = await Event.create({
      sportType,
      usersInterested,
      usersAttending,
      eventPicture,
      minimumRequiredAmountOfPpl,
      maxCapacity,
      location,
      hashTags,
      eventDescription,
      eventDateAndTime,
      organizator: userId,
      eventStatus,
    });

    if (event) {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $push: { "userInfo.eventsOrganized": event._id },
      });
      res.status(201).json(event);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all events creator
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    console.log(events.length);
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
    const eventId = req.params.eventId;
    const events = await Event.findOne({ _id: eventId });
    if (!events) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Delete an event
const deleteEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user._id;

  try {
    const event = await Event.find({ _id: eventId });
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if user is authorized
    if (event[0].organizator.toString() != userId.toString()) {
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

// Add an event to the user's 'eventsInterested' array and add this user to eventsLiked array
const addEventToInterested = async (req, res) => {
  const eventId = req.query.id; //if user is currently on specific event page
  const userId = req.user._id.toString();

  console.log("query test ", eventId);

  try {
    const user = await User.findOne({ _id: userId });

    const event = await Event.findById(eventId);
    if (user && event) {
      user.userInfo.eventsLiked.push(eventId); //push new liked event in user's array
      event.usersInterested.push(userId); //push new user interested in event's array
    }

    await user.save();
    await event.save();
    res
      .status(200)
      .json({ message: "Event added to interested list (user added too)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add an event to the user's 'eventsInterested' array and add this user to eventsLiked array
const addUserToAttendedEvent = async (req, res) => {
  const eventId = req.query.id; //if user is currently on specific event page
  const userId = req.user._id.toString();

  try {
    const user = await User.findOne({ _id: userId });

    const event = await Event.findById(eventId);
    console.log(user._id, user.username);
    if (user && event) {
      const eventUpdate = await Event.findByIdAndUpdate(
        { _id: eventId },
        {
          $push: {
            usersAttending: {
              userRef: user,
              username: user.username,
              userImage: user.userInfo.userImage,
              languagesSpoken: user.userInfo.languagesSpoken,
            },
          },
        },
        { new: true }
      );
    }
    res
      .status(200)
      .json({ message: "Event added to attending list (user added too)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const locationRetrieve = async (req, res) => {
  //to search event in city
  const { query } = req.query;
  const url = `http://dev.virtualearth.net/REST/v1/Locations?q=${encodeURIComponent(
    query
  )}&key=${process.env.API_KEY}`;
  axios
    .get(url)
    .then((responce) => {
      const data = responce.data;
      console.log(data.resourceSets[0].resources[0].name); //city name
      console.log(data.resourceSets[0].resources[0].point.coordinates[0]); //lat?
      console.log(data.resourceSets[0].resources[0].point.coordinates[1]); //long?

      res.status(200).json(data);
    })
    .catch((err) => console.log(err));

  try {
    // const events = await Event.find({ "location.address.city": query });

    const events = await Event.find({
      "location.address.city": { $regex: new RegExp(query, "i") },
    });

    console.log("eeeeevents?????", events);
  } catch (err) {
    console.log(err.message);
  }
  //   await events.save();
};
// Get location event
const eventLocation = async (req, res) => {
  try {
    const { houseNumber, street, city } = req.body;
    const location = await fetchLocationEvent(houseNumber, street, city);
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId },
      {
        "location.LatLng.lat": location.lat,
        "location.LatLng.lon": location.lon,
        "location.address.city": city,
        "location.address.street": street,
        "location.address.houseNumber": houseNumber,
      },
      { new: true }
    );
    if (!event) {
      res.status(404).json({ msg: "The lat and lon location not updated" });
    } else {
      res.status(200).json(event);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

module.exports = {
  createEvent,
  getAllEvents,
  viewOneEvent,
  deleteEvent,
  editEvent,
  addEventToInterested,
  addUserToAttendedEvent,
  locationRetrieve,
  eventLocation,
};
