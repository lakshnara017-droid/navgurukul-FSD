const express = require("express");
const router = express.Router();
const {
  upload,
  uploadStudents,
  uploadCourses,
  uploadLessons,
  uploadProgress,
  getAdminStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const adminOnly = [protect, authorize("admin")];

router.get("/stats", protect, authorize("admin", "mentor"), getAdminStats);
router.post("/upload/students", ...adminOnly, upload.single("file"), uploadStudents);
router.post("/upload/courses", ...adminOnly, upload.single("file"), uploadCourses);
router.post("/upload/lessons", ...adminOnly, upload.single("file"), uploadLessons);
router.post("/upload/progress", ...adminOnly, upload.single("file"), uploadProgress);

module.exports = router;
