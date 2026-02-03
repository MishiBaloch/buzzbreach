const { db } = require("../../database/config");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

const sendEmail = async (templateName, to, subject, data) => {
  try {
    const templatePath = path.join(__dirname, "../../views", templateName);
    const html = await ejs.renderFile(templatePath, data);
    console.log(templatePath, to, subject, data);

    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const getUserData = async (id) => {
  const cursor = await db.query(`
      FOR user IN users
      FILTER user.keycloakId== "${id}"
      RETURN user
  `);
  const info = await cursor.all();
  return info;
};
const getCorporateUserData = async (id) => {
  const getUser = await getUserData(id);
  const corporateCursor = await db.query(`
      FOR pages IN corporateUser
      FILTER pages.superAdmin.user == "${getUser[0]._key}"
      RETURN pages
    `);

  const corporatePages = await corporateCursor.all();
  return corporatePages;
};

const checkAdminSuperAdmin = async ({ id, user }) => {
  try {
    // check corporate user according to the corporate id provided
    const cursor = await db.query(`
        FOR corporate IN corporateUser
        FILTER corporate.corporate == "${id}"
        RETURN corporate
        `);
    const corporateData = await cursor.all();

    // const corporateUser = await getCorporateUserData(id);
    let checkAdmin;

    if (corporateData[0].admin !== undefined) {
      checkAdmin = corporateData[0].admin.filter((res) => {
        return res.user == user[0]._key;
      });
    }

    if (
      corporateData[0].superAdmin.user == user[0]._key ||
      checkAdmin.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

const emailService = ({ payload, recipient, templateName }) => {
  try {
    let config = {
      method: "post",
      url: process.env.EMAIL_SERVICE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data: { payload, recipient, templateName },
    };
    axios
      .request(config)
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getUserData,
  getCorporateUserData,
  checkAdminSuperAdmin,
  sendEmail,
  emailService,
};
