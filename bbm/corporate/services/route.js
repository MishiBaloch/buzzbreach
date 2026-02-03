const express = require("express");
const router = express.Router();

const {
  createService,
  updateService,
  getAllServices,
  getServiceById,
  deleteService,
} = require("./controller");
const {
  authMiddleware,
  isClientAdmin,
} = require("../../middleware/authMiddleware");

router.post("/:corporateId", authMiddleware, createService);
router.put("/:corporateId/:serviceId", authMiddleware, updateService);
router.get("/:corporateId", authMiddleware, getAllServices);
router.get("/id/:serviceId", authMiddleware, getServiceById);
router.delete("/:corporateId/:serviceId", authMiddleware, deleteService);
module.exports = router;
