const express = require("express");
const router = express.Router();
const { getStudents, getStudentDetail, exportStudents } = require("../controllers/mentorController");
const { protect, authorize } = require("../middleware/auth");

router.get("/students", protect, authorize("mentor", "admin"), getStudents);
router.get("/student/:id", protect, authorize("mentor", "admin"), getStudentDetail);
router.get("/export/students", protect, authorize("mentor", "admin"), exportStudents);

module.exports = router;
