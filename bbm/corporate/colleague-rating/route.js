const express = require("express");
const router = express.Router();

const {
  createRating,
  getAvgRatingsForUser,
  getAllRatingsByUser,
  viewProfileRating,
} = require("./controller");
const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.post(
  "/create-colleague-rating/:corporateId",
  authMiddleware,
  createRating
);
router.get(
  "/get-all-avg-rating-users/:corporateId",
  authMiddleware,
  getAvgRatingsForUser
);
router.get("/get-all-ratings-user", authMiddleware, getAllRatingsByUser);

router.get("/user/:userId", authMiddleware, viewProfileRating);
module.exports = router;
