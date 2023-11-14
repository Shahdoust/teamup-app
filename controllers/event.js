const Event = require("../schemas/Event");
const User = require("../schemas/User");

const { scheduleEventStatusUpdates } = require("../utils/backgroundTasks");
const { fetchLocationEvent } = require("../utils/location");

// Create event for specific sport
const createEvent = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventInfo = req.body;
    const locationDetails = await fetchLocationEvent(eventInfo.location);
    if (!locationDetails) {
      res.status(200).json({ msg: "Location not found" });
    }

    // find username with id from req
    // const userInfo = await User.findById({ _id: userId });

    // Update the lat and lon on schema location
    eventInfo.location = locationDetails;

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
    //Check all events status
    scheduleEventStatusUpdates();
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

  // const checkAddress = await Event.findOne({ _id: eventId });
  // const location_new = checkAddress.location.address;
  // const location_old = updatedEventInformation.location.address;

  // // Compare the address
  // if (JSON.stringify(location_new) !== JSON.stringify(location_old)) {
  //   const locationDetails = await fetchLocationEvent(
  //     updatedEventInformation.location
  //   );

  //   // Update the lat and lon on schema location
  //   updatedEventInformation.location.LatLng = locationDetails;
  // }

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
    res.status(200).json(updatedEvent);
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
  try {
    const user = await User.findOne({ _id: userId });
    const event = await Event.findById(eventId);

    const userInEvent = await Event.findOne({
      usersInterested: userId,
    });

    const eventInUser = await User.findOne({
      "userInfo.eventsLiked": eventId,
    });

    if (userInEvent && eventInUser) {
      //userId needs to be in array of event and likewise
      const removeEventFromUser = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $pull: { "userInfo.eventsLiked": eventId },
        }
      );

      const removeUserFromEvent = await Event.findByIdAndUpdate(
        { _id: eventId },
        {
          $pull: { usersInterested: userId },
        }
      );

      await user.save();
      await event.save();

      res.status(200).json({ msg: "You are not liking this event anymore" });
    } else {
      if (user && event) {
        user.userInfo.eventsLiked.push(eventId); //push new liked event in user's array
        event.usersInterested.push(userId); //push new user interested in event's array

        await user.save();
        await event.save();
        res
          .status(200)
          .json({ message: "Event added to interested list (user added too)" });
      } else {
        res.status(404).json({ msg: "Event or user not found" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add an event to the user's 'eventsInterested' array and add this user to eventsLiked array
const addUserToAttendedEvent = async (req, res) => {
  const eventId = req.query.id; //if user is currently on specific event page
  const userId = req.user._id;

  const stringUserId = userId.toString();
  console.log("ids", eventId);
  console.log("ids", userId);
  try {
    const user = await User.findById({ _id: userId });

    const event = await Event.findOne({ _id: eventId });

    // Check if user already attending
    const findUserAttending = await User.findOne({
      "userInfo.eventsAttended": eventId,
    });
    console.log("findUserAttending", findUserAttending);

    const findUserInEvent = await Event.findOne({
      "usersAttending.userRef": stringUserId,
    });
    console.log("findUserInEvent", findUserInEvent);

    if (findUserAttending && findUserInEvent) {
      const removeEventFromUser = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $pull: { "userInfo.eventsAttended": eventId },
        }
      );

      const removeUserFromEvent = await Event.findByIdAndUpdate(
        { _id: eventId },
        {
          $pull: {
            usersAttending: { userRef: stringUserId },
          },
        }
      );
      console.log("removeUserFromEvent", removeUserFromEvent);

      await user.save();
      await event.save();

      return res.status(201).json({ msg: "You are not attending anymore" });
    } else {
      const userUpdate = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            "userInfo.eventsAttended": eventId,
          },
        },
        { new: true }
      );
      // console.log(userUpdate);
      // if (user && event) {
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
      // }
      res
        .status(200)
        .json({ message: "Event added to attending list (user added too)" });
    }
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

// Edit comment
const editComment = async (req, res) => {
  const editCommentDetails = req.body;
  const userId = req.user._id;
  const { eventId, commentId } = req.params;
  try {
    const findComment = await Event.findOne({ _id: eventId });

    if (!findComment) {
      return res.status(404).json({ msg: "The event not exist to edit" });
    }
    if (findComment.eventComment[0].userId.equals(userId)) {
      findComment.eventComment[0].content =
        editCommentDetails.eventComment[0].content;
      await findComment.save();
    } else {
      return res
        .status(400)
        .json({ msg: "You are not permitted to edit comment" });
    }

    res.status(200).json({ msg: "Comment was successfully edited" });
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
      for (const comm of _isCommentId.eventComment) {
        if (comm._id.toString() === commentId) {
          const rep = comm.replies.push(replyDetails);
        }
      }

      // const replyComment = await Event.findByIdAndUpdate(
      //   { _id: eventId, "eventComment._id": commentId },
      //   {
      //     $push: {
      //       "eventComment.$.replies": replyDetails,
      //     },
      //   },
      //   { new: true }
      // );
      _isCommentId.save();
      res.status(200).json(_isCommentId);
    } else {
      res.status(400).json({ msg: "Reply to message not successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to check comment details to be deleted
function checkComments(findUserComment, userId, commentId) {
  let _isComment = false;
  for (let comm = 0; comm < findUserComment.eventComment.length; comm++) {
    if (commentId === findUserComment.eventComment[comm]._id.toString()) {
      if (findUserComment.eventComment[comm].userId.equals(userId)) {
        _isComment = true;
        break;
      }
    }
  }
  return _isComment;
}

// Delete one comment
const deleteComment = async (req, res) => {
  const userId = req.user._id;
  const { eventId, commentId } = req.params;

  try {
    const findUserComment = await Event.findOne({ _id: eventId });

    //TODO: remove the function checkComments
    const _isComment = checkComments(findUserComment, userId, commentId);
    if (findUserComment) {
      const eventComments = await Event.findOneAndUpdate(
        { _id: eventId, "eventComment.userId": userId },
        { $pull: { eventComment: { _id: commentId } } },
        { new: true }
      );
      if (!eventComments) {
        return res
          .status(401)
          .json({ msg: "Not possible to remove the comment (not permitted)" });
      }

      res.status(200).json(eventComments);
    } else {
      res.status(200).json({ msg: "You are not permitted to delete comment" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete one reply of comment
const deleteCommentReply = async (req, res) => {
  const userId = req.user._id;
  const { eventId, commentId, replyId } = req.params;

  try {
    const findUserComment = await Event.findOne({ _id: eventId });

    //TODO: remove the function checkComments
    const _isComment = checkComments(findUserComment, userId, commentId);
    if (findUserComment) {
      const commentReply = await Event.findOneAndUpdate(
        {
          _id: eventId,
          "eventComment.replies.userId": userId,
          "eventComment.replies._id": replyId,
        },
        { $pull: { "eventComment.$.replies": { _id: replyId } } },
        { new: true }
      );
      if (!commentReply) {
        return res.status(401).json({
          msg: "Not possible to remove the reply comment (not permitted)",
        });
      }
      res.status(200).json(commentReply);
    } else {
      res
        .status(200)
        .json({ msg: "You are not permitted to delete reply comment" });
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
  editComment,
  replyComment,
  deleteComment,
  deleteCommentReply,
};
