const User = require("../models/User");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");

// @route GET /api/mentor/students
exports.getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: "student", isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Enrich each student with progress summary
    const enriched = await Promise.all(
      students.map(async (student) => {
        const studentId = new mongoose.Types.ObjectId(student._id);
        const enrolledCourses = await Progress.distinct("courseId", { studentId });
        const completedLessons = await Progress.countDocuments({ studentId, completed: true });
        const totalTimeAgg = await Progress.aggregate([
          { $match: { studentId } },
          { $group: { _id: null, total: { $sum: "$timeSpent" } } },
        ]);
        return {
          ...student.toObject(),
          enrolledCourses: enrolledCourses.length,
          completedLessons,
          totalTimeSpent: totalTimeAgg[0]?.total || 0,
        };
      })
    );

    res.json({ success: true, total, page: parseInt(page), students: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/mentor/student/:id
exports.getStudentDetail = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.id);
    const student = await User.findById(studentId).select("-password");
    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Enrolled courses with progress
    const enrolledCourseIds = await Progress.distinct("courseId", { studentId });
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } });
    const courseProgress = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = await Lesson.countDocuments({ courseId: course._id });
        const completed = await Progress.countDocuments({
          studentId,
          courseId: course._id,
          completed: true,
        });
        const timeAgg = await Progress.aggregate([
          { $match: { studentId, courseId: course._id } },
          { $group: { _id: null, total: { $sum: "$timeSpent" } } },
        ]);
        return {
          course: course.toObject(),
          completedLessons: completed,
          totalLessons,
          progressPercent: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
          timeSpent: timeAgg[0]?.total || 0,
          status: completed === totalLessons && totalLessons > 0 ? "Completed" : "In Progress",
        };
      })
    );

    // Recent activities
    const recentActivities = await Activity.find({ userId: studentId })
      .populate("courseId", "title")
      .populate("lessonId", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    // Time series (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const timeSeries = await Progress.aggregate([
      { $match: { studentId, completed: true, completedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          minutes: { $sum: "$timeSpent" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", minutes: 1 } },
    ]);

    res.json({ success: true, student, courseProgress, recentActivities, timeSeries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/mentor/export/students (CSV)
exports.exportStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    const rows = await Promise.all(
      students.map(async (s) => {
        const studentId = new mongoose.Types.ObjectId(s._id);
        const enrolled = await Progress.distinct("courseId", { studentId });
        const completed = await Progress.countDocuments({ studentId, completed: true });
        return `${s.name},${s.email},${enrolled.length},${completed},${s.streak},${s.createdAt.toISOString()}`;
      })
    );
    const csv = ["Name,Email,EnrolledCourses,CompletedLessons,Streak,JoinedAt", ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students_report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
