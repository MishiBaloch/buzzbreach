const express = require("express");
const router = express.Router();

const {
  createCareerPath,
  updateCareerPath,
  getAllCareerPaths,
  getCareerPathById,
  deleteCareerPath,
} = require("./controller");
const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.post("/:corporateId", authMiddleware, createCareerPath);
router.put("/:corporateId/:careerPathId", authMiddleware, updateCareerPath);
router.get("/:corporateId", authMiddleware, getAllCareerPaths);
router.get("/id/:careerPathId", authMiddleware, getCareerPathById);
router.delete("/:corporateId/:careerPathId", authMiddleware, deleteCareerPath);
module.exports = router;
