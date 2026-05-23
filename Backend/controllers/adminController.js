const multer = require("multer");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");

// Multer config — store in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".xlsx", ".xls", ".csv", ".json"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Only xlsx, csv, json files allowed"));
  },
});
exports.upload = upload;

// Helper: parse file buffer
const parseFile = (buffer, mimetype, originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  let data;
  if (ext === ".json") {
    data = JSON.parse(buffer.toString());
  } else if (ext === ".csv" || ext === ".xlsx" || ext === ".xls") {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    data = xlsx.utils.sheet_to_json(sheet);
  } else {
    throw new Error("Unsupported file format");
  }
  return Array.isArray(data) ? data : [data];
};

// @route POST /api/admin/upload/students
exports.uploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const records = parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const results = { success: 0, failed: 0, errors: [], preview: records.slice(0, 5) };

    for (const record of records) {
      try {
        const existing = await User.findOne({ email: record.email });
        if (existing) { results.failed++; results.errors.push(`Duplicate: ${record.email}`); continue; }
        await User.create({
          name: record.name,
          email: record.email,
          password: record.password || "Password@123",
          role: "student",
        });
        results.success++;
      } catch (e) { results.failed++; results.errors.push(`${record.email}: ${e.message}`); }
    }
    res.json({ success: true, message: `Imported ${results.success} students`, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/upload/courses
exports.uploadCourses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const records = parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const results = { success: 0, failed: 0, errors: [], preview: records.slice(0, 5) };

    const defaultMentor = await User.findOne({ role: "mentor" });
    for (const record of records) {
      try {
        await Course.create({
          title: record.title,
          description: record.description || "No description",
          category: record.category || "Other",
          difficulty: record.difficulty || record.level || "Beginner",
          totalLessons: parseInt(record.totalLessons) || 0,
          duration: parseInt(record.duration) || 0,
          mentorId: defaultMentor?._id,
          thumbnail: record.thumbnail || "",
          tags: Array.isArray(record.tags) ? record.tags : (record.tags ? String(record.tags).split(",") : []),
        });
        results.success++;
      } catch (e) { results.failed++; results.errors.push(`${record.title || "Untitled"}: ${e.message}`); }
    }
    res.json({ success: true, message: `Imported ${results.success} courses`, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/upload/lessons
exports.uploadLessons = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const records = parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const results = { success: 0, failed: 0, errors: [], preview: records.slice(0, 5) };

    for (const record of records) {
      try {
        const course = await Course.findOne({ title: record.courseTitle });
        if (!course) { results.failed++; results.errors.push(`Course not found: ${record.courseTitle}`); continue; }
        await Lesson.create({
          title: record.title,
          courseId: course._id,
          duration: parseInt(record.duration) || 10,
          order: parseInt(record.order) || 1,
          type: record.type || (record.pdfUrl ? "pdf" : "video"),
          content: record.content || "",
          pdfUrl: record.pdfUrl || "",
          videoUrl: record.videoUrl || "",
        });
        results.success++;
      } catch (e) { results.failed++; results.errors.push(`${record.title}: ${e.message}`); }
    }
    res.json({ success: true, message: `Imported ${results.success} lessons`, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/upload/progress
exports.uploadProgress = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const records = parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const results = { success: 0, failed: 0, errors: [], preview: records.slice(0, 5) };

    for (const record of records) {
      try {
        const student = await User.findOne({ email: record.studentEmail });
        const lesson = await Lesson.findOne({ title: record.lessonTitle });
        if (!student || !lesson) { results.failed++; results.errors.push(`Not found: ${record.studentEmail}/${record.lessonTitle}`); continue; }
        await Progress.findOneAndUpdate(
          { studentId: student._id, lessonId: lesson._id },
          { courseId: lesson.courseId, completed: record.completed === "true" || record.completed === true, timeSpent: parseInt(record.timeSpent) || 0 },
          { upsert: true, new: true }
        );
        results.success++;
      } catch (e) { results.failed++; results.errors.push(e.message); }
    }
    res.json({ success: true, message: `Imported ${results.success} progress records`, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalMentors, totalCourses, totalLessons, totalActivities] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "mentor" }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Activity.countDocuments(),
    ]);
    const recentActivity = await Activity.find()
      .populate("userId", "name role")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, stats: { totalStudents, totalMentors, totalCourses, totalLessons, totalActivities }, recentActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
