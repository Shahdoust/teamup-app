const Event = require("../schemas/Event");
const cron = require("node-cron");

// Update event status
const updateEventStatuses = async (event) => {
  try {
    // Get event time from database and convert to string
    const eventTime = event.eventDateAndTime.eventTime;
    const dateString = eventTime; // Sample date and time string
    const dateObject = new Date(dateString);
    const eventTime_hours = dateObject.getUTCHours();
    const eventTime_minutes = dateObject.getUTCMinutes();
    const eventTimeString = `${eventTime_hours}:${eventTime_minutes}`;

    // Set current time and convert to string
    const currentTimestamp = new Date();
    const current_hours = currentTimestamp.getUTCHours();
    const current_minutes = currentTimestamp.getUTCMinutes();

    const currentTimeString = `${current_hours}:${current_minutes}`;
    let newStatus = "upcoming";
    // Update status if event is passed
    if (currentTimeString > eventTimeString) {
      newStatus = "completed";

      const result = await Event.findOneAndUpdate(
        { _id: event._id },
        { $set: { eventStatus: newStatus } },
        { new: true }
      );
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
        const cronExpression = `* * * * *`;

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
