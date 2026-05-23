const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");
const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

// @route GET /api/certificates/pending
// @desc Get students who reached 100% completion but have no certificate yet
exports.getPendingCertifications = async (req, res) => {
  try {
    // 1. Get all distinct student-course pairs from Progress
    const allProgress = await Progress.find({ completed: true }).populate("courseId studentId");
    
    // Group them manually
    const completionMap = {}; // "studentId-courseId" -> count
    
    for (const p of allProgress) {
      if (!p.courseId || !p.studentId) continue;
      const key = `${p.studentId._id}-${p.courseId._id}`;
      completionMap[key] = (completionMap[key] || 0) + 1;
    }

    const pending = [];
    
    // 2. Compare against total lessons for each course
    for (const [key, count] of Object.entries(completionMap)) {
      const [studentIdStr, courseIdStr] = key.split("-");
      const courseId = new mongoose.Types.ObjectId(courseIdStr);
      const studentId = new mongoose.Types.ObjectId(studentIdStr);
      
      const totalLessons = await Lesson.countDocuments({ courseId });
      
      if (totalLessons > 0 && count === totalLessons) {
        // The student completed all lessons for this course
        // Check if certificate exists
        const exists = await Certificate.findOne({ studentId, courseId });
        if (!exists) {
          const student = await User.findById(studentId).select("name email");
          const course = await Course.findById(courseId).select("title category");
          if (student && course) {
            pending.push({ student, course });
          }
        }
      }
    }

    res.json({ success: true, pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/certificates/generated
// @desc Get all generated certificates
exports.getGeneratedCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("studentId", "name email")
      .populate("courseId", "title category")
      .populate("issuedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/certificates/generate
// @desc Mentor generates a certificate for a student
exports.generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const issuedBy = req.user._id;

    let cert = await Certificate.findOne({ studentId, courseId });
    if (cert) {
      return res.status(400).json({ success: false, message: "Certificate already exists." });
    }

    cert = await Certificate.create({ studentId, courseId, issuedBy, status: "Generated" });
    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/certificates/claim
// @desc Student passes quiz and claims certificate
exports.claimCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const cert = await Certificate.findOne({ studentId, courseId });
    if (!cert) {
      return res.status(404).json({ success: false, message: "No certificate found for this course. Mentor must generate it first." });
    }

    cert.status = "Claimed";
    await cert.save();
    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/certificates/my
// @desc Student gets their claimed certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user._id;
    const certificates = await Certificate.find({ studentId, status: "Claimed" })
      .populate("courseId", "title category")
      .populate("issuedBy", "name")
      .sort({ updatedAt: -1 });

    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/certificates/my-status/:courseId
// @desc Student gets the status of a single course's certificate
exports.getMyCertificateStatus = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;
    const certificate = await Certificate.findOne({ studentId, courseId });
    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
