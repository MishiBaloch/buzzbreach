const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

const sendMail = (user, event, trackerLink) => {
  ejs.renderFile(
    path.join(__dirname, "../views/eventReminderEmail.ejs"),
    { user, event, trackerLink },
    (err, data) => {
      if (err) {
        console.error("Error rendering email template:", err);
        return;
      }

      const mailOptions = {
        from: process.env.EMAIL_HOST_USER,
        to: user.email,
        subject: `Reminder: Upcoming Event ${event.title}`,
        html: data,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error sending email to ${user.email}: `, error);
        } else {
          console.log(`Email sent to ${user.email}: `, info.response);
        }
      });
    }
  );
};

module.exports = {
  sendMail,
};
