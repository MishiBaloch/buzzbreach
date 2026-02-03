const express = require("express");
const router = express.Router();

const {
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
} = require("./controller");
const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.post("/create", authMiddleware, createCorporatePage);
router.post("/check-uri", authMiddleware, checkCorporateUri);
router.post("/check-domain", authMiddleware, checkDomain);
router.post("/send-otp", authMiddleware, sendOtp);
router.post("/verify-otp", authMiddleware, verifyOtp);
router.post("/check-name", authMiddleware, checkCorporateName);
router.get("/get-corporate-page/:id", authMiddleware, getCorporatePage);
router.get(
  "/get-all-corporate-pages",
  authMiddleware,
  getAllCorporatePagesforUser
);
router.get("/get-all-employees/:corporateId", authMiddleware, getAllEmployees);
router.get(
  "/get-all-previous-employees/:corporateId",
  authMiddleware,
  getAllPreviousEmployees
);
router.get("/page-info/:pageUri", authMiddleware, getPageInfoForUsers);
router.put("/publish-corporate-page/:id", authMiddleware, publishPage);
router.put("/disable-corporate-page/:id", authMiddleware, disablePage);
router.post(
  "/add-admin-corporate-page/:corporateId",
  authMiddleware,
  addAdminsToCorporatePage
);
router.put(
  "/update-corporate-page-info/:id",
  authMiddleware,
  updateCorporateInfo
);

module.exports = router;
