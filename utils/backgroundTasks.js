const Event = require("../schemas/Event");
const cron = require("node-cron");

// Update event status
const updateEventStatuses = async (event) => {
  const currentTimestamp = new Date();
  const eventTime = event.eventDateAndTime.eventTime;
  const hours = currentTimestamp.getUTCHours();
  const minutes = currentTimestamp.getUTCMinutes();

  const currentTimeString = `${hours}:${minutes}`;

  let newStatus = "Upcoming";
  if (currentTimeString >= eventTime) {
    newStatus = "Completed";
  }

  try {
    const result = await Event.updateOne(
      { _id: event._id },
      { $set: { status: newStatus } }
    );

    if (result.nModified === 1) {
      console.log(`Event ${event._id} status updated to ${newStatus}`);
    } else {
      console.error(`Event ${event._id} status update not modified`);
    }
  } catch (error) {
    console.error("Error updating event status:", error);
  }
};

// Schedule status for all events
const scheduleEventStatusUpdates = async () => {
  try {
    const events = await Event.find({});

    if (!events || events.length === 0) {
      console.error("No events found to schedule status updates");
      return; // Exit the function if there are no events.
    }

    events.forEach((event) => {
      const eventTime = event.eventDateAndTime.eventTime;

      if (eventTime) {
        const [hours, minutes] = eventTime.split(":");
        const eventHours = parseInt(hours, 10);
        const eventMinutes = parseInt(minutes, 10);

        let updateHours = eventHours - 1;
        if (updateHours < 0) {
          updateHours = 23;
        }
        const cronExpression = `${eventMinutes} ${updateHours} * * *`;

        cron.schedule(cronExpression, () => {
          updateEventStatuses(event);
        });
      }
    });
  } catch (error) {
    // console.error("Error fetching events:", error);
  }
};

module.exports = {
  scheduleEventStatusUpdates,
};
