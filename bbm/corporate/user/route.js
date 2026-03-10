const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  syncUser,
  getUserDetails,
  isUserClientAdmin,
  createIndividualUser,
  updateBasicInfo,
  updateProfessionalProfile,
  getProfessionalProfile,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
  completeOnboarding,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
} = require("./controller");

const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

// Auth Routes
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/sync", syncUser);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/verify-reset-otp", verifyResetOtp);
router.post("/auth/reset-password-with-otp", resetPasswordWithOtp);

// OAuth Routes
router.post("/auth/google", loginWithGoogle);
router.post("/auth/facebook", loginWithFacebook);
router.post("/auth/apple", loginWithApple);
router.get("/isadmin", authMiddleware, isClientAdmin, isUserClientAdmin);
router.get("/get-user-details", authMiddleware, getUserDetails);
router.get("/get-professional-profile", authMiddleware, getProfessionalProfile);
router.post("/create-individual-user", createIndividualUser);
router.put("/update-profile", authMiddleware, updateBasicInfo);
router.put(
  "/update-professional-profile",
  authMiddleware,
  updateProfessionalProfile
);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

module.exports = router;