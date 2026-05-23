const Course = require("../models/Course");
const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Activity = require("../models/Activity");

// @route GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 10, search } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: "i" };

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate("mentorId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // If student, attach progress
    if (req.user && req.user.role === "student") {
      const enriched = await Promise.all(
        courses.map(async (course) => {
          const lessons = await Lesson.find({ courseId: course._id });
          const completed = await Progress.countDocuments({
            studentId: req.user._id,
            courseId: course._id,
            completed: true,
          });
          const totalTime = await Progress.aggregate([
            { $match: { studentId: req.user._id, courseId: course._id } },
            { $group: { _id: null, total: { $sum: "$timeSpent" } } },
          ]);
          return {
            ...course.toObject(),
            completedLessons: completed,
            totalLessons: lessons.length,
            progressPercent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
            timeSpent: totalTime[0]?.total || 0,
          };
        })
      );
      return res.json({ success: true, total, page: parseInt(page), courses: enriched });
    }
    res.json({ success: true, total, page: parseInt(page), courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("mentorId", "name email avatar bio");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    const lessons = await Lesson.find({ courseId: course._id }).sort("order");
    let progressData = [];
    if (req.user && req.user.role === "student") {
      progressData = await Progress.find({ studentId: req.user._id, courseId: course._id });
      await Activity.create({ userId: req.user._id, type: "COURSE_STARTED", courseId: course._id });
    }
    res.json({ success: true, course, lessons, progressData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/courses (mentor/admin)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, difficulty, tags, duration } = req.body;
    const course = await Course.create({
      title,
      description,
      category,
      difficulty,
      tags,
      duration,
      mentorId: req.user._id,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/courses/enrolled (student)
exports.getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user._id;
    const enrolledCourseIds = await Progress.distinct("courseId", { studentId });
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).populate("mentorId", "name");
    const enriched = await Promise.all(
      courses.map(async (course) => {
        const totalLessons = await Lesson.countDocuments({ courseId: course._id });
        const completed = await Progress.countDocuments({ studentId, courseId: course._id, completed: true });
        const timeAgg = await Progress.aggregate([
          { $match: { studentId, courseId: course._id } },
          { $group: { _id: null, total: { $sum: "$timeSpent" } } },
        ]);
        return {
          ...course.toObject(),
          completedLessons: completed,
          totalLessons,
          progressPercent: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
          timeSpent: timeAgg[0]?.total || 0,
          status: completed === totalLessons && totalLessons > 0 ? "Completed" : "In Progress",
        };
      })
    );
    res.json({ success: true, courses: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
