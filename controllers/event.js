const Event = require("../schemas/Event");
const User = require("../schemas/User");

const { scheduleEventStatusUpdates } = require("../utils/backgroundTasks");
const { fetchLocationEvent } = require("../utils/location");

scheduleEventStatusUpdates();

// Create event for specific sport
const createEvent = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventInfo = req.body;
    const locationDetails = eventInfo.location; // await fetchLocationEvent(eventInfo.location);
    // if (!locationDetails) {
    //   res.status(200).json({ msg: "Location not found" });
    // }

    // find username with id from req
    // const userInfo = await User.findById({ _id: userId });

    // Update the lat and lon on schema location
    eventInfo.location.LatLng = locationDetails;

    const event = await Event.create({
      eventTitle: eventInfo.eventTitle,
      sportType: eventInfo.sportType,
      usersInterested: eventInfo.usersInterested,
      usersAttending: eventInfo.usersAttending,
      eventPicture: eventInfo.eventPicture,
      minimumRequiredAmountOfPpl: eventInfo.minimumRequiredAmountOfPpl,
      maxCapacity: eventInfo.maxCapacity,
      location: eventInfo.location,
      hashTags: eventInfo.hashTags,
      eventDescription: eventInfo.eventDescription,
      eventDateAndTime: eventInfo.eventDateAndTime,
      organizator: userId,
      eventStatus: eventInfo.eventStatus,
    });

    //bonding user with newly created event
    const populatedEvent = await Event.findById(event._id).populate({
      path: "organizator",
      select: "username userInfo.userImage",
    });

    if (event) {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $push: { "userInfo.eventsOrganized": event._id },
      });
      res.status(201).json(populatedEvent);
    }
  } catch (error) {
    // res.status(500).json({ error: error.message });
    console.log(error, "from controller");
  }
};

// Get all events creator
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizator", [
      "username",
      "userInfo.userImage",
    ]);

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
    const events = await Event.findOne({ _id: eventId }).populate(
      "organizator",
      ["username", "userInfo.userImage"]
    );
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

  const checkAddress = await Event.findOne({ _id: eventId });
  const location_new = checkAddress.location.address;
  const location_old = updatedEventInformation.location.address;

  // Compare the address
  if (JSON.stringify(location_new) !== JSON.stringify(location_old)) {
    const locationDetails = await fetchLocationEvent(
      updatedEventInformation.location
    );

    // Update the lat and lon on schema location
    updatedEventInformation.location.LatLng = locationDetails;
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updatedEventInformation },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "event not found" });
    }
    //make event completed
    // if (updatedEvent.eventDateAndTime.eventDate < Date.now()) {
    //   updatedEvent.status = "completed";
    // }

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

    // Check if user already attending
    const findUserAttending = await User.findOne({
      "userInfo.eventsAttended": eventId,
    });

    if (findUserAttending) {
      return res
        .status(201)
        .json({ msg: "You are already attending the event" });
    }
    const userUpdate = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          "userInfo.eventsAttended": eventId,
        },
      },
      { new: true }
    );

    if (user && event) {
      const eventUpdate = await Event.findByIdAndUpdate(
        { _id: eventId },
        {
          $push: {
            usersAttending: {
              userRef: user,
              username: user.username,
              userImage: user.userInfo.userImage,
              // languagesSpoken: user.userInfo.languagesSpoken,
            },
          },
        }
      );
    }

    res
      .status(200)
      .json({ message: "Event added to attending list (user added too)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get event by city in query
const getEventsInArea = async (req, res) => {
  try {
    const { city } = req.query;
    const events = await Event.find({
      "location.address.city": city,
    }).populate("organizator");

    if (events) {
      res.status(200).send(events);
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

// Create comment
const createComment = async (req, res) => {
  const commentDetails = req.body;
  const userId = req.user._id;
  const { eventId } = req.params;

  try {
    const comment = await Event.findByIdAndUpdate(
      { _id: eventId },
      {
        $push: {
          eventComment: {
            userId: userId,
            content: commentDetails.eventComment[0].content,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (comment) {
      res.status(200).json(comment);
    } else {
      res.status(401).json({ msg: "The comment was not created" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reply to comment
const replyComment = async (req, res) => {
  const replyCommentDetails = req.body;
  const userId = req.user._id;
  const { eventId, commentId } = req.params;

  // Details comment object
  const replyDetails = {
    userId: userId,
    content: replyCommentDetails.replies[0].content,
    timestamp: new Date(),
  };

  try {
    const _isCommentId = await Event.findOne({
      "eventComment._id": commentId,
    });
    if (_isCommentId) {
      const replyComment = await Event.findByIdAndUpdate(
        { _id: eventId, "eventComment._id": commentId },
        {
          $push: {
            eventComment: {
              replies: replyDetails,
            },
          },
        },
        { new: true }
      );

      res.status(200).json(replyComment);
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
  getEventsInArea,
  createComment,
  replyComment,
};
