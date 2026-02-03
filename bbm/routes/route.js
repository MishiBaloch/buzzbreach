const express = require("express");
const router = express.Router();

const userRoutes = require("../corporate/user/route");
const corporatePage = require("../corporate/corporate-page-info/route");
const jobRoutes = require("../corporate/jobs/route");
const eventRoutes = require("../corporate/events/route");
const colleagueRating = require("../corporate/colleague-rating/route");
const sentimentQuizRoutes = require("../corporate/vendor-network-sentiments/route");
const serviceRoutes = require("../corporate/services/route");
const careerPathRoutes = require("../corporate/career-path/route");
const subscriptionRequest = require("../corporate/subscription-request/route");
const subscriptionRoutes = require("../corporate/subscription/route");

router.use("/corporate/page", corporatePage);
router.use("/corporate/job", jobRoutes);
router.use("/user", userRoutes);
router.use("/corporate/event", eventRoutes);
router.use("/corporate/colleague/rating", colleagueRating);
router.use("/corporate/vendor-network-sentiments", sentimentQuizRoutes);
router.use("/corporate/services", serviceRoutes);
router.use("/corporate/career-path", careerPathRoutes);
router.use("/corporate/subscription-request", subscriptionRequest);
router.use("/corporate/subscription", subscriptionRoutes);

module.exports = router;
