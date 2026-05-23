const express = require("express");
const router = express.Router();
const { getMyProgress, getCourseProgress } = require("../controllers/progressController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("student"), getMyProgress);
router.get("/course/:courseId", protect, authorize("student"), getCourseProgress);

module.exports = router;
