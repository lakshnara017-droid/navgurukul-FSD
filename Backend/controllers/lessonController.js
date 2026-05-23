const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");
const Course = require("../models/Course");

// @route GET /api/lessons/:id
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("courseId", "title");
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });
    let progress = null;
    if (req.user.role === "student") {
      progress = await Progress.findOne({ studentId: req.user._id, lessonId: lesson._id });
    }
    res.json({ success: true, lesson, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/lessons/start
exports.startLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    let progress = await Progress.findOne({ studentId: req.user._id, lessonId });
    if (!progress) {
      progress = await Progress.create({
        studentId: req.user._id,
        courseId: lesson.courseId,
        lessonId,
        startedAt: new Date(),
      });
    }
    await Activity.create({
      userId: req.user._id,
      type: "LESSON_STARTED",
      courseId: lesson.courseId,
      lessonId,
    });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/lessons/complete
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId, timeSpent } = req.body;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const progress = await Progress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          completed: true,
          completedAt: new Date(),
          courseId: lesson.courseId,
        },
        $inc: { timeSpent: timeSpent || 0 }
      },
      { new: true, upsert: true }
    );

    // Update streak
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
      user.streak = diff === 1 ? user.streak + 1 : diff === 0 ? user.streak : 1;
    }
    user.lastActivityDate = new Date();
    await user.save();

    await Activity.create({
      userId: req.user._id,
      type: "LESSON_COMPLETED",
      courseId: lesson.courseId,
      lessonId,
      metadata: { timeSpent },
    });

    // Check if course is fully completed
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    const completedLessons = await Progress.countDocuments({
      studentId: req.user._id,
      courseId: lesson.courseId,
      completed: true,
    });
    if (totalLessons === completedLessons) {
      await Activity.create({
        userId: req.user._id,
        type: "COURSE_COMPLETED",
        courseId: lesson.courseId,
        metadata: { totalLessons },
      });
    }
    res.json({ success: true, progress, streak: user.streak });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/lessons/update-time
exports.updateLessonTime = async (req, res) => {
  try {
    const { lessonId, timeSpent } = req.body;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    const progress = await Progress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $inc: { timeSpent: timeSpent || 1 },
        $setOnInsert: { courseId: lesson.courseId, startedAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/lessons/:id  (admin or mentor)
exports.updateLesson = async (req, res) => {
  try {
    const allowed = ["title", "content", "pdfUrl", "videoUrl", "duration", "order", "type", "isPublished"];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/lessons  (admin or mentor — create a lesson)
exports.createLesson = async (req, res) => {
  try {
    const { title, courseId, duration, order, content, videoUrl, pdfUrl, type } = req.body;
    if (!title || !courseId) return res.status(400).json({ success: false, message: "title and courseId required" });
    const lesson = await Lesson.create({ title, courseId, duration, order, content, videoUrl, pdfUrl, type });
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
