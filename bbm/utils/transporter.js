const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


// configure the transporter for nodemailer to use gmail account to send mails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});


module.exports = transporter;
