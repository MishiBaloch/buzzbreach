const express = require("express");
const router = express.Router();

const {
  createSubscriptionRequest,
  getAllSubscriptionRequest,
  getSubscriptionRequestByID,
  getSubscriptionPlans,
  selectSubscriptionPlan,
  getSelectedSubscriptionPlan,
} = require("./controller");
const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.post("/:corporateId", authMiddleware, createSubscriptionRequest);
router.get("/subscription-plans", authMiddleware, getSubscriptionPlans);
router.get("/:corporateId", authMiddleware, getAllSubscriptionRequest);
router.get("/id/:requestId", authMiddleware, getSubscriptionRequestByID);

module.exports = router;
