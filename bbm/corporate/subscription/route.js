const express = require("express");
const router = express.Router();

const {
  selectSubscriptionPlan,
  getSelectedSubscriptionPlan,
} = require("./controller");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.post(
  "/:corporateId/:subscriptionPlanId",
  authMiddleware,
  selectSubscriptionPlan
);
router.get("/:corporateId", authMiddleware, getSelectedSubscriptionPlan);

module.exports = router;
