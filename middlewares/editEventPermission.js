const jwt = require("jsonwebtoken");
const User = require("../schemas/User");
const Event = require("../schemas/Event");
// Check if user is permitted to edit a specific event
const checkEventOwner = async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user._id.toString();

  try {
    const event = await Event.findById(eventId).populate("organizator");
    const user = await User.findById(userId); //find user to push the event into eventsOrganized

    const orgID = event.organizator._id.toString();

    if (orgID === user._id.toString()) {
      await User.findByIdAndUpdate(user._id, {
        $push: { "userInfo.eventsOrganized": event._id },
      });
      // user.userInfo.eventsOrganized.push(event._id.toString());
    } //pushes the event if user is creator (probably needs to be done in creating)

    if (!event || orgID !== userId) {
      return res
        .status(403)
        .json({ error: "you are not authorized to update this event" });
    }
    // res.status(200).json(event);
    // await user.save();
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to retrieve event information" });
  }
};

module.exports = checkEventOwner;
