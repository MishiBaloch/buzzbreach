const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
  updateEvent,
  getAllEventsCorporate,
  getRegisteredUsersForEvent,
  postponeEvent,
  cancelEvent,
  getAllRatingsOfEvent,
  getAvgRatingsOfEvent,
} = require("./controller");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.route("/create-event/:corporateId").post(authMiddleware, createEvent);
router.route("/").get( authMiddleware,getAllEvents);
router.route("/:eventId").get(authMiddleware, getEventById);
router
  .route("/specificCorporateEvents/:corporateId")
  .get(authMiddleware, getAllEventsCorporate);

router.route("/:corporateId/:eventId").delete(authMiddleware, deleteEvent);
router.route("/:corporateId/:eventId").put(authMiddleware, updateEvent);
router
  .route("/:eventId/registered-users")
  .get(authMiddleware, getRegisteredUsersForEvent);
router
  .route("/:corporateId/:eventId/postponed")
  .put(authMiddleware, postponeEvent);
router.route("/:corporateId/:eventId/cancel").put(authMiddleware, cancelEvent);
router.route("/get-all-rating-of-event/:eventId").get(getAllRatingsOfEvent);
router.route("/get-avg-rating-of-event/:eventId").get(getAvgRatingsOfEvent);

module.exports = router;
