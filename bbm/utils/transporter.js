const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Configure the transporter for nodemailer to use email account to send mails
// Supports Gmail, Outlook, and other SMTP providers
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true" || false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  // Add timeout and connection options
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter configuration on startup
if (process.env.EMAIL_HOST && process.env.EMAIL_HOST_USER && process.env.EMAIL_HOST_PASSWORD) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("[Email] Transporter verification failed:", error.message);
      console.error("[Email] Please check your EMAIL_HOST, EMAIL_HOST_USER, and EMAIL_HOST_PASSWORD in .env file");
    } else {
      console.log("[Email] Transporter is ready to send emails");
    }
  });
} else {
  console.warn("[Email] Email configuration missing. Set EMAIL_HOST, EMAIL_HOST_USER, and EMAIL_HOST_PASSWORD in .env file");
}

module.exports = transporter;
