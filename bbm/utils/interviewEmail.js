const transporter = require("./transporter.js");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

// send email

const interviewEmail = async ({
  email,
  applicationId,
  interviewInstructions,
}) => {
  try {
    const requiredPath = path.join(__dirname, "../views/interviewEmail.ejs");
    const data = await ejs.renderFile(requiredPath, {
      email: email,
      applicationId: applicationId,
      instruction: interviewInstructions,
      baseUrl: process.env.BASE_URL,
    });
    const options = {
      from: process.env.EMAIL_HOST_USER, // sender address
      to: email,
      subject: "Interview Confirmation", // Subject line
      html: data,
    };
    const mailSent = await transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
    if (mailSent) return Promise.resolve(1);
    //   Email(options)
  } catch (err) {
    console.log(err.message);
  }
};
const interviewMessageEmail = async ({
  email,
  companyName,
  name,
  jobTitle,
  message
}) => {
  try {
    const requiredPath = path.join(__dirname, "../views/sendMessageNotification.ejs");
    const data = await ejs.renderFile(requiredPath, {
      companyName,
      jobTitle,
      name,
      message
    });
    const options = {
      from: process.env.EMAIL_HOST_USER, // sender address
      to: email,
      subject: "New Message from Your Recruiter", // Subject line
      html: data,
    };
    const mailSent = await transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });
    if (mailSent) return Promise.resolve(1);
    //   Email(options)
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  interviewEmail,
  interviewMessageEmail
};
