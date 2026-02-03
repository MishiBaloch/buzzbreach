const { db } = require("../../database/config");
const {
  getCorporateUserData,
  checkAdminSuperAdmin,
  getUserData,
  emailService,
} = require("../utility/utilityFunction");
const Corporate = db.collection("corporate");
const CorporateUser = db.collection("corporateUser");
const SubscriptionRequest = db.collection("subscriptionRequest");
const SubscriptionPlans = db.collection("subscriptionPlans");
const CorporateSubscriptionPlans = db.collection("corporateSubscriptionPlans");

const {
  subscriptionRequestSubmitted,
  subscriptionRequestedAdmin,
} = require("../../utils/subscriptionRequestEmail");
const Templates = db.collection("emailTemplates");

const createSubscriptionRequest = async (req, res) => {
  try {
    const {
      subscriptionMode,
      requestorName,
      requestorEmail,
      companyName,
      companyWebsite,
      city,
      state,
      country,
      subscriptionPlan,
      subscriptionPlanId,
      subscriptionDuration,
      featuresRequested,
      requestorPhoneNo,
      message,
    } = req.body;

    const corporateId = req.params.corporateId;

    const user = await getUserData(req.user.sub);
    if (user.length < 1) {
      return res.status(404).json({ message: "User not found" });
    }
    const admin = await checkAdminSuperAdmin({ id: corporateId, user: user });

    if (!admin) {
      return res.status(401).json({ message: "Not authorised" });
    }

    const create = await SubscriptionRequest.save({
      requestorName,
      requestorEmail,
      requestDate: new Date(),
      companyName,
      companyWebsite,
      city,
      state,
      country,
      subscriptionPlan,
      subscriptionPlanId,
      subscriptionDuration,
      featuresRequested,
      approvalStatus: "pending",
      requestorPhoneNo,
      message,
      subscriptionMode,
      corporate: corporateId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const SubscriptionRequestInfo = await SubscriptionRequest.document(
      create._key
    );

    // Subscription Plan Request Submitted - User Notification Email

    const checkForTemplateCursor1 = await Templates.byExample({
      name: "Subscription Plan Request Submitted - User Notification",
    });

    const template1 = await checkForTemplateCursor1.all();
    if (template1[0]) {
      const payload = { subscriptionRequest: SubscriptionRequestInfo };
      emailService({
        payload: payload,
        recipient: requestorEmail,
        templateName: "Subscription Plan Request Submitted - User Notification",
      });
    } else {
      //  send email to admin and the user
      subscriptionRequestSubmitted({
        name: requestorName,
        email: requestorEmail,
      });
    }

    // Subscription Request Received - Admin Notification Email

    const checkForTemplateCursor = await Templates.byExample({
      name: "Subscription Request Received - Admin Notification",
    });

    const template = await checkForTemplateCursor.all();
    if (template[0]) {
      const payload = { subscriptionRequest: SubscriptionRequestInfo };
      emailService({
        payload: payload,
        recipient: requestorEmail,
        templateName: "Subscription Request Received - Admin Notification",
      });
    } else {
      subscriptionRequestedAdmin({
        email: requestorEmail,
        name: requestorName,
        subscriptionPlan: subscriptionPlan,
        companyName: companyName,
        phoneNo: requestorPhoneNo,
        date: new Date(),
      });
    }

    res.status(200).json({ data: create });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllSubscriptionRequest = async (req, res) => {
  try {
    const corporateId = req.params.corporateId;
    const cursor = await db.query(
      `FOR request IN subscriptionRequest
        FILTER request.corporate == "${corporateId}"
        SORT request.requestDate DESC
        RETURN request
        `
    );
    const info = await cursor.all();
    res.status(200).json({ data: info });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSubscriptionRequestByID = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const info = await SubscriptionRequest.document(requestId);
    res.status(200).json({ data: info });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSubscriptionPlans = async (req, res) => {
  try {
    const cursor = await db.query(
      `FOR plan IN subscriptionPlans
        SORT plan.createdAt DESC
        FILTER plan.active == true AND plan.isArchived == false AND plan.isDeleted == false
        RETURN plan
        `
    );
    const info = await cursor.all();
    res.status(200).json({ length: info.length, data: info });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }};



module.exports = {
  createSubscriptionRequest,
  getAllSubscriptionRequest,
  getSubscriptionRequestByID,
  getSubscriptionPlans
};
