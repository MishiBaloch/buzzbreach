const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobApplications,
  getAllJobsCorporate,
  getJobApplicationById,
  numberOfApplicants,
  approveOrRejectApplication,
  jobApplicantsInfo,
  shortlistAndScheduleInterview,
  interviewConfirmation,
  closeJobApplication,
  updateViewedStatus,
  updateInterviewFeedback,
  sendMessageNotification,
  applicationRejected
} = require("../jobs/controller");

const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.route("/create-job/:corporateId").post(authMiddleware,createJob);
router.route("/get-all-jobs").get(authMiddleware, getAllJobs);
router
  .route("/get-all-jobs-corporate/:corporateId")
  .get(authMiddleware, getAllJobsCorporate);
router.route("/get-job/:id").get(authMiddleware, getJobById);
router.route("/update-job/:corporateId/:jobId").put(authMiddleware, updateJob);
router
  .route("/delete-job/:corporateId/:jobId")
  .delete(authMiddleware, deleteJob);
router
  .route("/get-all-job-applications/:id")
  .get(authMiddleware, getAllJobApplications);
router
  .route("/get-job-application/:id")
  .get(authMiddleware, getJobApplicationById);
router
  .route("/number-of-applicants/:jobId")
  .get(authMiddleware, numberOfApplicants);
router
  .route("/job-applicants-info/:jobId")
  .get(authMiddleware, jobApplicantsInfo);
router
  .route("/approve-reject-application/:corporateId/:applicationId")
  .post(authMiddleware, approveOrRejectApplication);
  router
  .route("/shortlist-and-schedule-interview/:corporateId/:applicationId")
  .post(authMiddleware, shortlistAndScheduleInterview);
  router
  .route("/send-message-notification/:corporateId/:applicationId")
  .post(authMiddleware, sendMessageNotification);
  router
  .route("/interview-confirmation/:corporateId/:applicationId")
  .post(authMiddleware, interviewConfirmation);
  router
  .route("/close/:corporateId/:applicationId")
  .post(authMiddleware, closeJobApplication);
  router
  .route("/view-status/:corporateId/:applicationId")
  .post(authMiddleware, updateViewedStatus);
  router
  .route("/interview/feedback/:corporateId/:applicationId")
  .post(authMiddleware, updateInterviewFeedback);
  router
  .route("/rejected/:corporateId/:applicationId")
  .post(authMiddleware, applicationRejected);

// router.route("/create-job").post(createJob);
// router.route("/get-all-jobs").get(getAllJobs);
// router.route("/get-job/:id").get(getJobById);
// router.route("/update-job/:id").put(updateJob);
// router.route("/delete-job/:id").delete(deleteJob);
// router.route("/get-all-job-applications").get(getAllJobApplications);

module.exports = router;
