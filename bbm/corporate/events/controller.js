const { db } = require("../../database/config");
const moment = require("moment-timezone");
const Event = db.collection("corporateEvent");
const Corporate = db.collection("corporate");
const Registration = db.collection("eventRegistration");
const Feedback = db.collection("eventFeedback");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Templates = db.collection("emailTemplates");
const emailService = require("../utility/utilityFunction");
const {
  cancelEventEmail,
  rescheduleEventEmail,
} = require("../../utils/eventsEmail");

const {
  getUserData,
  checkAdminSuperAdmin,
  sendEmail,
} = require("../utility/utilityFunction");

// const createEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       desc,
//       timeZone,
//       startTime,
//       endTime,
//       organizer,
//       tags,
//       bannerImg,
//       email,
//       eventLink,
//       lastDateOfRegistration,
//     } = req.body;
//     const userId = req.user.sub;
//     const corporateId = req.params.corporateId;

//     const user = await getUserData(userId);
//     const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
//     if (!hasAccess)
//       return res
//         .status(403)
//         .json({ error: "Not authorized to create event for this corporate" });

//     const corporateInfo = await Corporate.document(corporateId);
//     const newEvent = {
//       title,
//       desc,
//       timeZone,
//       startTime,
//       endTime,
//       organizer,
//       tags,
//       bannerImg,
//       email,
//       isHidden: false,
//       eventLink: eventLink,
//       corporateName: corporateInfo.name,
//       corporatePageUri: corporateInfo.pageUri,
//       corporate: corporateId,
//       logo: corporateInfo.logo,
//       user: user[0]._key,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       status: "Upcoming",
//       isPostponed: false,
//       isCancelled: false,
//       cancellationMessage: "",
//       postponementMessage: "",
//       lastDateOfRegistration,
//     };

//     const result = await Event.save(newEvent);
//     const event = await Event.document(result._key);
//     res
//       .status(201)
//       .json({ message: "Event created successfully!", data: event });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const createEvent = async (req, res) => {
  try {
    const {
      title,
      desc,
      timeZone,
      startTime,
      endTime,
      organizer,
      tags,
      bannerImg,
      email,
      eventLink,
      lastDateOfRegistration,
      eventMode,
      street,
      city,
      state,
      country,
      zip,
    } = req.body;

    // Get today's date (without time) for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight

    // Validation for startTime and endTime
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Start time and End time are required." });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ error: "Invalid start time or end time format." });
    }

    if (start < today) {
      return res
        .status(400)
        .json({ error: "Start time must not be earlier than today's date." });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ error: "Start time must be earlier than End time." });
    }

    const userId = req.user.sub;
    const corporateId = req.params.corporateId;

    const user = await getUserData(userId);
    const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
    if (!hasAccess) {
      return res
        .status(403)
        .json({ error: "Not authorized to create event for this corporate" });
    }

    const corporateInfo = await Corporate.document(corporateId);
    const newEvent = {
      title,
      desc,
      timeZone,
      address: { street, city, state, zip, country },
      startTime,
      endTime,
      organizer,
      tags,
      bannerImg,
      email,
      eventMode,
      isHidden: false,
      eventLink: eventLink,
      corporateName: corporateInfo.name,
      corporatePageUri: corporateInfo.pageUri,
      corporate: corporateId,
      logo: corporateInfo.logo,
      user: user[0]._key,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "Upcoming",
      isPostponed: false,
      isCancelled: false,
      cancellationMessage: "",
      postponementMessage: "",
      lastDateOfRegistration,
    };
    const result = await Event.save(newEvent);
    const event = await Event.document(result._key);
    res
      .status(201)
      .json({ message: "Event created successfully!", data: event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await db
      .query(
        `
        FOR doc IN corporateEvent 
        SORT doc.createdAt DESC
        RETURN doc
      `
      )
      .then((cursor) => cursor.all());

    // Return empty array if no events (don't return 404)
    if (events.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const now = moment();

    const eventsWithStatus = events.map((event) => {
      const startTime = moment.tz(event.startTime, event.timeZone);
      const endTime = moment.tz(event.endTime, event.timeZone);

      event.status = "Upcoming";

      if (event.isCancelled) {
        event.status = "Cancelled";
      } else if (now.isBetween(startTime, endTime)) {
        event.status = "Live";
      } else if (now.isAfter(endTime)) {
        event.status = "Ended";
      } else if (now.isBefore(startTime)) {
        event.status = "Upcoming";
      }

      return {
        ...event,
      };
    });
    eventsWithStatus.sort((a, b) => {
      const statusOrder = { Live: 1, Upcoming: 2, Cancelled: 3, Ended: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    res.status(200).json({ data: eventsWithStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllEventsCorporate = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;
    const events = await db
      .query(
        `
      FOR event IN corporateEvent
      FILTER event.corporate == @corporateId
      RETURN event
    `,
        { corporateId }
      )
      .then((cursor) => cursor.all());

    if (events.length === 0)
      return res
        .status(404)
        .json({ error: "No events found for this corporate" });

    const now = moment();

    const eventsWithStatus = events.map((event) => {
      const startTime = moment.tz(event.startTime, event.timeZone);
      const endTime = moment.tz(event.endTime, event.timeZone);

      event.status = "Upcoming";

      if (event.isCancelled) {
        event.status = "Cancelled";
      } else if (now.isBetween(startTime, endTime)) {
        event.status = "Live";
      } else if (now.isAfter(endTime)) {
        event.status = "Ended";
      } else if (now.isBefore(startTime)) {
        event.status = "Upcoming";
      }

      return {
        ...event,
      };
    });
    eventsWithStatus.sort((a, b) => {
      const statusOrder = { Live: 1, Upcoming: 2, Cancelled: 3, Ended: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    res.status(200).json({ data: eventsWithStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.sub;

    const event = await Event.document(eventId).catch(() => null);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const now = moment();
    const startTime = moment.tz(event.startTime, event.timeZone);
    const endTime = moment.tz(event.endTime, event.timeZone);

    event.status = "Upcoming";

    if (event.isCancelled) {
      event.status = "Cancelled";
    } else if (now.isBetween(startTime, endTime)) {
      event.status = "Live";
    } else if (now.isAfter(endTime)) {
      event.status = "Ended";
    } else if (now.isBefore(startTime)) {
      event.status = "Upcoming";
    }

    const userCursor = await db.query(`
          FOR user IN users
          FILTER user.keycloakId == "${userId}"
          RETURN user
      `);
    const user = await userCursor.all();

    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const registrationCursor = await db.query(`
          FOR reg IN eventRegistration
          FILTER reg.userId == "${user[0]._key}" AND reg.eventId == "${eventId}"
          RETURN reg
      `);
    const registration = await registrationCursor.all();

    const isRegistered = registration.length > 0;

    res.status(200).json({ data: event, isRegistered: isRegistered });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const updatedValues = req.body;
    const userId = req.user.sub;
    const corporateId = req.params.corporateId;

    const user = await getUserData(userId);
    const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
    console.log(hasAccess);
    if (!hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to update this event1" });

    const event = await Event.document(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // if (updatedValues.startTime || updatedValues.endTime) {
    //   if (event.startTime != updatedValues.startTime || event.endTime != updatedValues.endTime) {
    //     return res.status(400).json({ message: "Can not change the event time!" })
    //   }
    // }

    updatedValues.updatedAt = new Date();

    await Event.update(eventId, updatedValues);
    const updatedEvent = await Event.document(eventId);
    res.status(200).json({ message: "Event updated successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.sub;
    const corporateId = req.params.corporateId;

    const user = await getUserData(userId);
    const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
    if (!hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to delete this event" });

    const event = await Event.document(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await Event.remove(eventId);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRegisteredUsersForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if the event exists
    const event = await Event.document(eventId).catch(() => null);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Query to get registered users along with their profile data
    const registeredUsersCursor = await db.query(
      `
        FOR reg IN eventRegistration
        FILTER reg.eventId == @eventId
        FOR user IN users
        FILTER user._key == reg.userId
        LET profile = FIRST(FOR p IN profile FILTER p.user == user._key RETURN p)
        RETURN {
          name: CONCAT(user.firstName, " ", user.lastName),
          username: user.userName,
          profileImg: user.profileImg,
          phoneNo: user.phoneNo,
          email: user.email,
          userType: user.userType,
          dob: user.dob,
          nationality: user.nationality,
          gender: user.gender,
          currentCity: user.currentCity,
          about: user.about,
          keycloakId: user.keycloakId,
          videoUrl: user.videoUrl,
          profile: profile
        }
      `,
      { eventId }
    );

    const registeredUsers = await registeredUsersCursor.all();

    if (registeredUsers.length === 0) {
      return res
        .status(404)
        .json({ error: "No registered users found for this event" });
    }

    res.status(200).json({ data: registeredUsers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const postponeEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { startTime, endTime, message } = req.body;
    const userId = req.user.sub;
    const corporateId = req.params.corporateId;

    const user = await getUserData(userId);
    const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
    if (!hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to update this event" });

    const event = await Event.document(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.user !== user[0]._key && !hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to update this event" });

    const updates = {
      updatedAt: new Date(),
      isPostponed: true,
      isCancelled: false,
      status: "postponed",
      startTime: startTime,
      endTime: endTime,
      postponementMessage: message,
    };

    await Event.update(eventId, updates);
    const updatedEvent = await Event.document(eventId);

    // Send email to all registered users
    const registeredUsersCursor = await db.query(
      `
        FOR reg IN eventRegistration
        FILTER reg.eventId == @eventId
        FOR user IN users
        FILTER user._key == reg.userId
        RETURN user
      `,
      { eventId }
    );
    const registeredUsers = await registeredUsersCursor.all();

    registeredUsers.forEach(async (user) => {
      await rescheduleEventEmail({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        eventName: updatedEvent.title,
        originalDate: event.startTime,
        startTime: startTime,
        endTime: endTime,
      });
    });

    res
      .status(200)
      .json({ message: "Event postponed successfully!", data: updatedEvent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cancelEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { message } = req.body;
    const userId = req.user.sub;
    const corporateId = req.params.corporateId;

    const user = await getUserData(userId);
    const hasAccess = await checkAdminSuperAdmin({ id: corporateId, user });
    if (!hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to update this event" });

    const event = await Event.document(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.user !== user[0]._key && !hasAccess)
      return res
        .status(403)
        .json({ error: "Not authorized to update this event" });

    const updates = {
      updatedAt: new Date(),
      isPostponed: false,
      isCancelled: true,
      status: "Cancelled",
      cancellationMessage: message,
    };

    await Event.update(eventId, updates);
    const updatedEvent = await Event.document(eventId);

    // Send email to all registered users
    const registeredUsersCursor = await db.query(
      `
        FOR reg IN eventRegistration
        FILTER reg.eventId == @eventId
        FOR user IN users
        FILTER user._key == reg.userId
        RETURN user
      `,
      { eventId }
    );
    const registeredUsers = await registeredUsersCursor.all();
    registeredUsers.forEach(async (user) => {
      await cancelEventEmail({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        eventName: updatedEvent.title,
        originalDate: event.startTime,
        cancellationReason: message,
        contactEmail: updatedEvent.email,
      });
    });

    res
      .status(200)
      .json({ message: "Event Cancelled successfully!", data: updatedEvent });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllRatingsOfEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.document(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const cursor = await db.query(
      `
        FOR doc IN eventRating 
        SORT doc.ratedAt DESC
        FILTER doc.eventId == @eventId
        FOR user IN users
        FILTER user._key == doc.userId
        RETURN {
          name: CONCAT(user.firstName, " ", user.lastName),
          userName: user.userName,
          profileImg: user.profileImg,
          userEmail: user.email,
          phoneNo: user.phoneNo,
          rating: doc.rating,
          comment: doc.comment
        }
      `,
      { eventId }
    );
    const ratings = await cursor.all();

    if (ratings.length === 0) {
      return res
        .status(404)
        .json({ error: "No rating added yet for this event" });
    }

    res.status(200).json({ data: ratings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAvgRatingsOfEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const cursor = await db.query(
      `
        FOR doc IN eventRating 
        FILTER doc.eventId == @eventId
        COLLECT AGGREGATE avgRating = AVERAGE(doc.rating)       
        RETURN { averageRating: avgRating }
      `,
      { eventId }
    );
    const ratings = await cursor.all();

    res.status(200).json({ data: ratings[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendReminderEmails = async () => {
  // console.log("Current UTC time:", moment.utc().format());
  // console.log("Current time ", moment.tz("Australia/ACT").format());

  // Fetch events that are starting in the next 15 minutes
  const events = await db
    .query(
      `
    FOR event IN corporateEvent
    RETURN event
  `
    )
    .then((cursor) => cursor.all());

  // console.log(now);

  for (const event of events) {
    const eventTime = moment.tz(event.startTime, event.timeZone);
    // console.log("eventTime in timeZONE: ", eventTime.format("YYYY-MM-DDTHH:mm"));

    const now = moment.tz(event.timeZone);
    // console.log(now.format("YYYY-MM-DDTHH:mm"));

    const eventTimePlus15 = eventTime.clone().subtract(15, "minutes");
    // console.log("15min prior", eventTimePlus15.format("YYYY-MM-DDTHH:mm"));

    if (
      now.format("YYYY-MM-DDTHH:mm") ==
      eventTimePlus15.format("YYYY-MM-DDTHH:mm")
    ) {
      const registrations = await db
        .query(
          `
        FOR reg IN eventRegistration
        FILTER reg.eventId == @eventId && (!HAS(reg, 'reminderSent') || reg.reminderSent != true)
        RETURN reg
      `,
          { eventId: event._key }
        )
        .then((cursor) => cursor.all());

      for (const reg of registrations) {
        const user = await db.collection("users").document(reg.userId);
        // const trackerLink = `https://test.awokenin.com/event-tracker?eventId=${event._key}&userId=${user._key}`;
        const trackerLink = `${process.env.BASE_URL}/event-tracker?eventId=${event._key}&userId=${user._key}`;
        // console.log(trackerLink);
        console.log(event.eventMode);
        if (event.eventMode === "Offline") {
          // Offline event reminder email
          const checkForTemplateCursor = await Templates.byExample({
            name: "Offline Event Reminder",
          });

          const template = await checkForTemplateCursor.all();
          if (template[0]) {
            const payload = {
              users: user,
              corporateEvent: event,
            };
            emailService({
              payload: payload,
              recipient: user.email,
              templateName: "Offline Event Reminder",
            });
          } else {
            await sendEmail(
              "offlineEventReminderEmail.ejs",
              user.email,
              `Reminder: Upcoming Event ${event.title}`,
              {
                userName: `${user.firstName} ${user.lastName}`,
                eventName: event.title,
                eventStartTiming: event.startTime,
                eventEndTiming: event.endTime,
                timeZone: event.timeZone,
                organizer: event.organizer,
                address: event.address,
              }
            );
          }
        } else {
          // send event reminder email
          const checkForTemplateCursor = await Templates.byExample({
            name: "Event Reminder",
          });

          const template = await checkForTemplateCursor.all();
          if (template[0]) {
            const payload = {
              users: user,
              corporateEvent: event,
              // trackerLink: trackerLink,
            };
            emailService({
              payload: payload,
              recipient: user.email,
              templateName: "Event Reminder",
            });
          } else {
            await sendEmail(
              "eventReminderEmail.ejs",
              user.email,
              `Reminder: Upcoming Event ${event.title}`,
              {
                userName: `${user.firstName} ${user.lastName}`,
                eventName: event.title,
                eventStartTiming: event.startTime,
                eventEndTiming: event.endTime,
                timeZone: event.timeZone,
                trackerLink: trackerLink,
                organizer: event.organizer,
              }
            );
          }
        }

        // sendMail(user, event, trackerLink);

        await db
          .collection("eventRegistration")
          .update(reg._key, { reminderSent: true });
      }
    }
    if (
      now.format("YYYY-MM-DDTHH:mm") == eventTime.format("YYYY-MM-DDTHH:mm")
    ) {
      // console.log("first")
      const registrations = await db
        .query(
          `
        FOR reg IN eventRegistration
        FILTER reg.eventId == @eventId && (!HAS(reg, 'eventStartReminderSent') || reg.eventStartReminderSent != true)
        RETURN reg
      `,
          { eventId: event._key }
        )
        .then((cursor) => cursor.all());

      for (const reg of registrations) {
        const user = await db.collection("users").document(reg.userId);
        // const trackerLink = `https://test.awokenin.com/event-tracker?eventId=${event._key}&userId=${user._key}`;
        const trackerLink = `${process.env.BASE_URL}/event-tracker?eventId=${event._key}&userId=${user._key}`;

        // sendMail(user, event, trackerLink);

        if (event.eventMode === "Offline") {
          // Offline event reminder email
          const checkForTemplateCursor = await Templates.byExample({
            name: "Offline Event Reminder",
          });

          const template = await checkForTemplateCursor.all();
          if (template[0]) {
            const payload = {
              users: user,
              corporateEvent: event,
            };
            emailService({
              payload: payload,
              recipient: user.email,
              templateName: "Offline Event Reminder",
            });
          } else {
            await sendEmail(
              "offlineEventReminderEmail.ejs",
              user.email,
              `Reminder: Upcoming Event ${event.title}`,
              {
                userName: `${user.firstName} ${user.lastName}`,
                eventName: event.title,
                eventStartTiming: event.startTime,
                eventEndTiming: event.endTime,
                timeZone: event.timeZone,
                organizer: event.organizer,
                address: event.address,
              }
            );
          }
        } else {
          // send event start reminder email
          const checkForTemplateCursor = await Templates.byExample({
            name: "Event Start Reminder",
          });

          const template = await checkForTemplateCursor.all();
          if (template[0]) {
            const payload = {
              users: user,
              corporateEvent: event,
              // trackerLink: trackerLink,
            };
            emailService({
              payload: payload,
              recipient: user.email,
              templateName: "Event Start Reminder",
            });
          } else {
            await sendEmail(
              "eventStartReminderEmail.ejs",
              user.email,
              `Event Started: ${event.title}`,
              {
                userName: `${user.firstName} ${user.lastName}`,
                eventName: event.title,
                eventStartTiming: event.startTime,
                eventEndTiming: event.endTime,
                timeZone: event.timeZone,
                trackerLink: trackerLink,
                organizer: event.organizer,
              }
            );
          }
        }

        await db
          .collection("eventRegistration")
          .update(reg._key, { eventStartReminderSent: true });
      }
    }
  }
};

cron.schedule("* * * * *", sendReminderEmails);

module.exports = {
  createEvent,
  getAllEvents,
  getAllEventsCorporate,
  getEventById,
  updateEvent,
  deleteEvent,
  getRegisteredUsersForEvent,
  postponeEvent,
  cancelEvent,
  getAllRatingsOfEvent,
  getAvgRatingsOfEvent,
  sendReminderEmails,
};
