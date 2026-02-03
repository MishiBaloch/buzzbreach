const transporter = require("./transporter.js");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

const rescheduleEventEmail = async ({
  name,
  email,
  eventName,
  originalDate,
  startTime,
  endTime,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: "Important Update: Event Rescheduled",
      html: await ejs.renderFile(
        path.join(__dirname, "../views/rescheduleEvent.ejs"),
        {
          name,
          eventName,
          originalDate,
          startTime,
          endTime,
        }
      ),
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const cancelEventEmail = async ({
  name,
  email,
  eventName,
  originalDate,
  cancellationReason,
  contactEmail,
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: email,
      subject: "Important Update: Event Cancellation",
      html: await ejs.renderFile(
        path.join(__dirname, "../views/cancelEvent.ejs"),
        {
          name: name,
          eventName,
          originalDate,
          cancellationReason,
          contactEmail,
        }
      ),
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  rescheduleEventEmail,
  cancelEventEmail,
};
