const express = require("express");
const router = express.Router();
const {
  getPendingCertifications,
  getGeneratedCertificates,
  generateCertificate,
  claimCertificate,
  getMyCertificates,
  getMyCertificateStatus
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middleware/auth");

// Mentor Routes
router.get("/pending", protect, authorize("mentor", "admin"), getPendingCertifications);
router.get("/generated", protect, authorize("mentor", "admin"), getGeneratedCertificates);
router.post("/generate", protect, authorize("mentor", "admin"), generateCertificate);

// Student Routes
router.post("/claim", protect, authorize("student"), claimCertificate);
router.get("/my", protect, authorize("student"), getMyCertificates);
router.get("/my-status/:courseId", protect, authorize("student"), getMyCertificateStatus);

module.exports = router;
