const express = require("express");
const router = express.Router();
const {
  getLessonById,
  startLesson,
  completeLesson,
  updateLessonTime,
  updateLesson,
  createLesson,
} = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/auth");

router.get("/:id", protect, getLessonById);
router.post("/start", protect, authorize("student"), startLesson);
router.post("/update-time", protect, authorize("student"), updateLessonTime);
router.post("/complete", protect, authorize("student"), completeLesson);
router.post("/", protect, authorize("admin", "mentor"), createLesson);
router.patch("/:id", protect, authorize("admin", "mentor"), updateLesson);

module.exports = router;
