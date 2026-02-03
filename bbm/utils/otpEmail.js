const transporter = require("./transporter.js");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

const otpEmail = async ({ firstName, lastName, corporateEmail, otp }) => {
  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: corporateEmail,
    subject: "Your OTP Code",
    html: await ejs.renderFile(
      path.join(__dirname, "../views/verifyEmailWithOtp.ejs"),
      {
        name: firstName + " " + lastName,
        otp,
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
};

module.exports = {
  otpEmail,
};
