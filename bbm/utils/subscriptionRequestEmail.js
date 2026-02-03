const transporter = require("./transporter.js");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

// send email

const subscriptionRequestSubmitted = async ({ email, name }) => {
  try {
    const requiredPath = path.join(
      __dirname,
      "../views/susbcriptionRequestSubmittedEmail.ejs"
    );
    const data = await ejs.renderFile(requiredPath, {
      email: email,
      name,
    });
    const options = {
      from: process.env.EMAIL_HOST_USER, // sender address
      to: email,
      subject: "Subscription Plan Request Received", // Subject line
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

const subscriptionRequestedAdmin = async ({
  email,
  name,
  subscriptionPlan,
  companyName,
  phoneNo,
  date,
}) => {
  try {
    const requiredPath = path.join(
      __dirname,
      "../views/susbcriptionRequestedAdminEmail.ejs"
    );
    const data = await ejs.renderFile(requiredPath, {
      email: email,
      name,
      subscriptionPlan,
      phoneNo,
      companyName,
      date,
    });
    const options = {
      from: process.env.EMAIL_HOST_USER, // sender address
      to: process.env.EMAIL_HOST_USER,
      subject: "New Subscription Plan Request Received", // Subject line
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
  subscriptionRequestSubmitted,
  subscriptionRequestedAdmin,
};
