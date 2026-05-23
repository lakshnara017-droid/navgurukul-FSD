const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// @route GET /api/progress
exports.getMyProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const progress = await Progress.find({ studentId })
      .populate("courseId", "title category thumbnail")
      .populate("lessonId", "title duration order");
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/progress/course/:courseId
exports.getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;
    const totalLessons = await Lesson.countDocuments({ courseId });
    const progress = await Progress.find({ studentId, courseId }).populate("lessonId", "title duration order");
    const completedLessons = progress.filter((p) => p.completed).length;
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    res.json({
      success: true,
      totalLessons,
      completedLessons,
      progressPercent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      totalTimeSpent,
      lessonProgress: progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
