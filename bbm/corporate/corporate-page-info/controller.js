const { db } = require("../../database/config");
const dns = require("dns");
const Corporate = db.collection("corporate");
const CorporateUser = db.collection("corporateUser");
const {
  getUserData,
  emailService,
  checkAdminSuperAdmin,
} = require("../utility/utilityFunction");
const otpCollection = db.collection("otp");
const { otpEmail } = require("../../utils/otpEmail");
const Templates = db.collection("emailTemplates");
const Users = db.collection("users");

const createCorporatePage = async (req, res) => {
  try {
    const {
      logo,
      cover,
      name,
      about,
      founded,
      industry,
      employees,
      emailInfo,
      contact,
      socialLinks,
      awards,
      address,
      policyAcceptance,
      pageUri,
      publish,
      acceptTermsAndConditions,
      haveOwnDomainEmail,
    } = req.body;
    const user = req.user;
    const cursor = await db.query(`FOR user IN users
  FILTER user.keycloakId== "${user.sub}"
  RETURN user
  `);
    const info = await cursor.all();
    // check if corporate page exist with the same name
    const corporatePageCursor = await db.query(`
      FOR corp IN corporate
      FILTER corp.name == "${name}"
      RETURN corp
      `);
    const corporatePage = await corporatePageCursor.all();

    if (corporatePage.length > 0) {
      return res.status(409).json({ message: "name already exist" });
    }
    const createPage = await Corporate.save({
      logo,
      cover,
      name,
      about,
      founded,
      industry,
      employees,
      emailInfo,
      contact,
      socialLinks,
      awards,
      address,
      pageUri,
      policyAcceptance,
      acceptTermsAndConditions,
      haveOwnDomainEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: info[0]._key,
      publish: publish,
      disable: false,
    });

    const createUser = await CorporateUser.save({
      corporate: createPage._key,
      superAdmin: {
        user: info[0]._key,
        email: info[0].email,
        firstName: info[0].firstName,
        lastName: info[0].lastName,
        img: info[0].profileImg,
      },
      admin: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ data: createPage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkCorporateUri = async (req, res) => {
  try {
    const { pageName } = req.body;

    // Validate pageName to allow only letters (a-z, A-Z) and numbers (0-9)
    const isValidUri = /^[a-zA-Z0-9]+$/.test(pageName);

    if (!isValidUri) {
      return res.status(400).json({ message: "Invalid URI format" });
    }

    const cursor = await db.query(`
        FOR name IN corporate
        FILTER name.pageUri == "${pageName}"
        RETURN name
        `);
    const check = await cursor.all();
    if (check.length > 0) {
      return res.status(409).json({ message: "not available" });
    }
    return res.status(200).json({ message: "available" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkCorporateName = async (req, res) => {
  try {
    const { name } = req.body;
    const cursor = await db.query(`
        FOR corp IN corporate
        FILTER corp.name == "${name}"
        RETURN corp
        `);
    const check = await cursor.all();
    if (check.length > 0) {
      return res.status(409).json({ message: "not available" });
    }
    return res.status(200).json({ message: "available" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCorporatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const keycloakId = req.user.sub;

    const corporateData = await Corporate.document(id);

    const isUserDeletedOrDeactivated = await Users.document(corporateData.user);

    if (
      isUserDeletedOrDeactivated.deletion &&
      isUserDeletedOrDeactivated.deletion.deleteFlag == true
    ) {
      return res.status(404).json({
        message:
          "The creator of this page has deleted their profile. This page is no longer accessible.",
      });
    }

    if (
      isUserDeletedOrDeactivated.deactivate &&
      isUserDeletedOrDeactivated.deactivate.deactivate == true
    ) {
      return res.status(403).json({
        message:
          "The creator of this page has deactivated their profile. Some information may be unavailable.",
      });
    }

    let followedStatus = false;
    const user = await getUserData(keycloakId);
    const userId = user[0]._key;

    const checkFollowQuery = `
    FOR f IN corporatePageFollowers
      FILTER f.userId == @userId AND f.pageId == @pageId
      RETURN f
  `;

    const checkFollowStatus = await db.query(checkFollowQuery, {
      userId: `users/${userId}`,
      pageId: `${id}`,
    });

    const result = await checkFollowStatus.all();

    if (result.length > 0) {
      followedStatus = true;
    }

    const cursor = await db.query(
      `FOR info IN corporate  FILTER info._key == "${id}" 
    AND (!HAS(info, 'permanentlyDeletedByAdmin') OR info.permanentlyDeletedByAdmin == false)
  RETURN info`
    );

    const getCorporatePage = await cursor.all();
    if (getCorporatePage == undefined || getCorporatePage.length == 0) {
      return res.status(404).json({ message: "not found" });
    }
    return res
      .status(200)
      .json({ data: getCorporatePage[0], followedStatus: followedStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCorporatePagesforUser = async (req, res) => {
  try {
    const user = req.user;
    const cursor = await db.query(`
      FOR user IN users
      FILTER user.keycloakId== "${user.sub}"
      RETURN user
  `);
    const info = await cursor.all();
    const corporateCursor = await db.query(`
      FOR pages IN corporate
      FILTER pages.user == "${info[0]._key}" 
      AND (!HAS(pages, 'permanentlyDeletedByAdmin') OR pages.permanentlyDeletedByAdmin == false)
      RETURN pages
      `);

    const corporatePages = await corporateCursor.all();
    if (corporatePages.length < 1 || corporatePages == undefined) {
      return res.status(404).json({ message: "no pages found" });
    }
    return res.status(200).json({ data: corporatePages });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const publishPage = async (req, res) => {
  try {
    const { id } = req.params;
    const cursor = await Corporate.update(id, { publish: true });
    return res.status(200).json({ data: cursor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const disablePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { disable } = req.body;
    const cursor = await Corporate.update(id, { disable: disable });
    return res.status(200).json({ data: cursor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCorporateInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      logo,
      cover,
      name,
      about,
      founded,
      industry,
      employees,
      emailInfo,
      contact,
      socialLinks,
      awards,
      address,
      mission,
      vision,
      history,
      culturevideoUrl,
      cultureImgLinks,
      cultureDescription,
      perksAndBenefits,
      divercityAndInclusion,
      keyPersons,
      subscriptionPlan,
      subscriptionMode,
    } = req.body;
    const updateData = await Corporate.update(id, {
      logo,
      cover,
      name,
      about,
      founded,
      industry,
      employees,
      emailInfo,
      contact,
      socialLinks,
      awards,
      address,
      mission,
      vision,
      history,
      culturevideoUrl,
      cultureImgLinks,
      cultureDescription,
      perksAndBenefits,
      divercityAndInclusion,
      keyPersons,
      subscriptionPlan,
      subscriptionMode,
      updatedAt: new Date(),
    });
    res.status(200).json({ data: updateData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPageInfoForUsers = async (req, res) => {
  try {
    const { pageUri } = req.params;

    let followedStatus = false;
    let removedStatus = false;
    const keycloakId = req.user.sub;

    const user = await getUserData(keycloakId);
    const userId = user[0]._key;

    const cursor = await db.query(`
      FOR info IN corporate
      FILTER info.pageUri == "${pageUri}"
      RETURN info`);

    const data = await cursor.all();

    const isUserDeletedOrDeactivated = await Users.document(data[0].user);

    if (
      isUserDeletedOrDeactivated.deletion &&
      isUserDeletedOrDeactivated.deletion.deleteFlag == true
    ) {
      return res.status(404).json({
        message:
          "The creator of this page has deleted their profile. This page is no longer accessible.",
      });
    }

    if (
      isUserDeletedOrDeactivated.deactivate &&
      isUserDeletedOrDeactivated.deactivate.deactivate == true
    ) {
      return res.status(403).json({
        message:
          "The creator of this page has deactivated their profile. Some information may be unavailable.",
      });
    }

    const corporateId = data[0]._key;

    const checkFollowQuery = `
      FOR f IN corporatePageFollowers
        FILTER f.userId == @userId AND f.pageId == @corporateId
        RETURN f
    `;

    const checkFollowStatus = await db.query(checkFollowQuery, {
      userId: `users/${userId}`,
      corporateId: `${corporateId}`,
    });

    const result = await checkFollowStatus.all();

    if (
      result.length > 0 &&
      !result[0].status &&
      result[0].status !== "removed"
    ) {
      followedStatus = true;
    }

    if (
      result.length > 0 &&
      result[0].status &&
      result[0].status == "removed"
    ) {
      removedStatus = true;
    }

    if (data[0].disable == true) {
      return res.status(403).json({ message: "page is disabled" });
    } else if (data[0].publish == false) {
      return res.status(403).json({ message: "page yet to be published" });
    }
    res.status(200).json({
      data: data[0],
      followedStatus: followedStatus,
      removedStatus: removedStatus,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const { corporateId } = req.params;

    // Fetch corporate data
    const corporateData = await Corporate.document(corporateId);
    if (!corporateData) {
      throw new Error("Corporate data not found");
    }

    const companyName = corporateData.name.toLowerCase();

    // Query profiles with work experience matching the company name and currently working status
    const cursorProfiles = await db.query(
      `
      FOR profile IN profile
        FILTER LENGTH(profile.workExperience) > 0
        FOR experience IN profile.workExperience
          FILTER LOWER(experience.employer) == @companyName AND experience.currentlyWorking == true
          LET user = DOCUMENT(users, profile.user)
          RETURN MERGE(
          {
          firstName:user.firstName,
          lastName:user.lastName,
          email:user.email,
          gender:user.gender,
          dob:user.dob,
          profileImg:user.profileImg,
          username:user.userName,
          }, {
            user: profile.user,
            workExperience: [experience],
           
          })
      `,
      { companyName }
    );

    const profiles = await cursorProfiles.all();

    res.status(200).json({ data: profiles });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addAdminsToCorporatePage = async (req, res) => {
  try {
    const { corporateId } = req.params;
    const userName = req.body.userName;
    const user = req.user.sub;
    const userCursor = await db.query(`
      FOR user IN users
      FILTER user.userName == "${userName}"
      RETURN user
      `);
    const userData = await userCursor.all();
    if (userData.length < 1) {
      return res.status(404).json({ message: "user not found" });
    }

    const adminData = await checkAdminSuperAdmin({
      id: corporateId,
      user: userData,
    });
    console.log(adminData);
    if (adminData) {
      return res.status(409).json({ message: "admin already exist" });
    }

    if (!adminData) {
      const newAdmin = {
        firstName: userData[0].firstName,
        lastName: userData[0].lastName,
        email: userData[0].email,
        img: userData[0].profileImg,
        user: userData[0]._key,
      };
      const corporateUserCursor = await db.query(`
        FOR data IN corporateUser
        FILTER data.corporate == "${corporateId}"
        RETURN data
        `);
      const corporateUserData = await corporateUserCursor.all();
      let admin = corporateUserData[0].admin;
      admin.push(newAdmin);
      const updateCorporateUser = await CorporateUser.update(
        corporateUserData[0]._key,
        { admin, updatedAt: new Date() }
      );
      res.status(200).json({ message: "admin created successfully" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllPreviousEmployees = async (req, res) => {
  try {
    const { corporateId } = req.params;

    // Fetch corporate data
    const corporateData = await Corporate.document(corporateId);
    if (!corporateData) {
      throw new Error("Corporate data not found");
    }

    const companyName = corporateData.name.toLowerCase();

    // Query profiles with work experience matching the company name and currently working status
    const cursorProfiles = await db.query(
      `
      FOR profile IN profile
        FILTER LENGTH(profile.workExperience) > 0
        FOR experience IN profile.workExperience
          FILTER LOWER(experience.employer) == @companyName AND experience.currentlyWorking == false
          LET user = DOCUMENT(users, profile.user)
          RETURN MERGE(
          {
          firstName:user.firstName,
          lastName:user.lastName,
          email:user.email,
          gender:user.gender,
          dob:user.dob,
          profileImg:user.profileImg,
          username:user.userName,
          }, {
            user: profile.user,
            workExperience: [experience],
           
          })
      `,
      { companyName }
    );

    const profiles = await cursorProfiles.all();

    res.status(200).json({ data: profiles });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Utility function to generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { corporateEmail } = req.body;

    const getUser = await getUserData(req.user.sub);
    const user = getUser[0]._key;
    if (!corporateEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTP and store it in the database
    const otp = generateOtp();
    const createdAt = Date.now();

    // Delete any existing unused OTP for this phone number
    await db.query(
      `
      FOR otp IN otp
      FILTER otp.user == @user && otp.used == false
      REMOVE otp IN otp
    `,
      { user }
    );

    // Insert the new OTP into the database
    await otpCollection.save({
      user,
      otp,
      createdAt,
      used: false,
    });

    // Corporate Page Email Verification Email

    const checkForTemplateCursor = await Templates.byExample({
      name: "Corporate Page Email Verification",
    });

    const template = await checkForTemplateCursor.all();
    if (template[0]) {
      // const infoOTP = await otpCollection.document(otpInfo._key);
      const payload = { users: getUser[0], otp: otp };
      emailService({
        payload: payload,
        recipient: corporateEmail,
        templateName: "Corporate Page Email Verification",
      });
    } else {
      otpEmail({
        firstName: getUser[0].firstName,
        lastName: getUser[0].lastName,
        otp,
        corporateEmail,
      });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const getUser = await getUserData(req.user.sub);
    const user = getUser[0]._key;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // Retrieve OTP from the database
    const cursor = await db.query(
      `
      FOR otp IN otp
      FILTER otp.user == @user && otp.otp == @otp && otp.used == false
      RETURN otp
    `,
      { user, otp }
    );

    const otpRecord = await cursor.next();

    // Check if OTP exists and is within the expiration period (e.g., 5 minutes)
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (!otpRecord || Date.now() - otpRecord.createdAt > expirationTime) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used and save it
    await otpCollection.update(otpRecord._key, {
      used: true,
      updatedAt: Date.now(),
    });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkDomain = async (req, res) => {
  try {
    const { webUrl } = req.body;
    if (!webUrl) {
      return res.status(400).json({ error: "Web url is required" });
    }
    const domainInfo = webUrl.split("https://")[1];
    console.log(domainInfo);
    dns.lookup(domainInfo, (err, address) => {
      if (err) {
        return res.status(400).json({
          error: err.message,
          message: "Domain does not exist or cannot be resolved",
        });
      }
      res
        .status(200)
        .json({ message: `Domain ${domainInfo} exists.`, data: address });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCorporatePage,
  checkCorporateUri,
  getCorporatePage,
  getAllCorporatePagesforUser,
  publishPage,
  disablePage,
  updateCorporateInfo,
  getPageInfoForUsers,
  getAllEmployees,
  addAdminsToCorporatePage,
  getAllPreviousEmployees,
  checkCorporateName,
  sendOtp,
  verifyOtp,
  checkDomain,
};
