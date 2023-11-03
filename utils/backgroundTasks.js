const Event = require("../schemas/Event");
const cron = require("node-cron");

// Update event status
const updateEventStatuses = async (event) => {
  try {
    const eventTimeString = convertDateTime(event.eventDateAndTime.eventTime);
    // Set current time and convert to string
    const currentTimestamp = new Date();
    const currentTimeString = convertDateTime(currentTimestamp);

    // Check date
    const eventDate = event.eventDateAndTime.eventDate;
    const dayEvent = eventDate.getUTCDay();
    const currentDay = currentTimestamp.getUTCDay();
    const diffDay = dayEvent - currentDay;

    // Check month
    const eventMonth = eventDate.getMonth();
    const currentMonth = currentTimestamp.getMonth();
    const diffMonth = eventMonth - currentMonth;

    let newStatus = "upcoming";
    // Update status if event is passed
    if (currentTimeString > eventTimeString && diffDay < 0 && diffMonth < 0) {
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
function convertDateTime(time, date, currentDateTime) {
  // Get event time from database and convert to string
  const eventTime = time;
  const dateString = eventTime;
  const dateObject = new Date(dateString);
  const eventTime_hours = dateObject.getUTCHours();
  const eventTime_minutes = dateObject.getUTCMinutes();
  const eventTimeString = `${eventTime_hours}:${eventTime_minutes}`;

  return eventTimeString;
}

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
