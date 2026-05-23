const express = require("express");
const router = express.Router();
const { getCourses, getCourseById, createCourse, getEnrolledCourses } = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getCourses);
router.get("/enrolled", protect, authorize("student"), getEnrolledCourses);
router.get("/:id", protect, getCourseById);
router.post("/", protect, authorize("mentor", "admin"), createCourse);

module.exports = router;
