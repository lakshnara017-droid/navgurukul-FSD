const Progress = require("../models/Progress");
const Activity = require("../models/Activity");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// @route GET /api/analytics/progress
exports.getProgressAnalytics = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    // Total lessons across enrolled courses
    const enrolledCourseIds = await Progress.distinct("courseId", { studentId });
    let totalLessons = 0;
    for (const courseId of enrolledCourseIds) {
      totalLessons += await Lesson.countDocuments({ courseId });
    }

    // Aggregation pipeline for completed lessons + time
    const result = await Progress.aggregate([
      { $match: { studentId } },
      {
        $group: {
          _id: null,
          completedLessons: { $sum: { $cond: ["$completed", 1, 0] } },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
    ]);

    const completedLessons = result[0]?.completedLessons || 0;
    const totalTimeSpent = result[0]?.totalTimeSpent || 0;
    const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      success: true,
      data: {
        completedLessons,
        totalLessons,
        completionRate,
        totalTimeSpent,
        enrolledCourses: enrolledCourseIds.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/timeseries
exports.getTimeSeries = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const result = await Progress.aggregate([
      {
        $match: {
          studentId,
          completedAt: { $gte: startDate },
          completed: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          minutes: { $sum: "$timeSpent" },
          lessonsCompleted: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", minutes: 1, lessonsCompleted: 1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/distribution
exports.getCourseDistribution = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    const result = await Progress.aggregate([
      { $match: { studentId } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: "$courseId",
          courseName: { $first: "$course.title" },
          category: { $first: "$course.category" },
          completedLessons: { $sum: { $cond: ["$completed", 1, 0] } },
          totalTime: { $sum: "$timeSpent" },
        },
      },
      {
        $lookup: {
          from: "lessons",
          localField: "_id",
          foreignField: "courseId",
          as: "lessons",
        },
      },
      {
        $project: {
          courseName: 1,
          category: 1,
          completedLessons: 1,
          totalLessons: { $size: "$lessons" },
          totalTime: 1,
          progressPercent: {
            $cond: [
              { $gt: [{ $size: "$lessons" }, 0] },
              {
                $multiply: [
                  { $divide: ["$completedLessons", { $size: "$lessons" }] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { progressPercent: -1 } },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/activity
exports.getActivityFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const activities = await Activity.find({ userId: req.user._id })
      .populate("courseId", "title")
      .populate("lessonId", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/analytics/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    // Get completion rate
    const enrolledCourseIds = await Progress.distinct("courseId", { studentId });
    let totalLessons = 0;
    for (const courseId of enrolledCourseIds) {
      totalLessons += await Lesson.countDocuments({ courseId });
    }
    const completedCount = await Progress.countDocuments({ studentId, completed: true });
    const completionRate = totalLessons ? (completedCount / totalLessons) * 100 : 0;

    // Check inactivity
    const User = require("../models/User");
    const user = await User.findById(req.user._id);
    const daysSinceActive = user.lastActivityDate
      ? Math.floor((new Date() - new Date(user.lastActivityDate)) / (1000 * 60 * 60 * 24))
      : 999;

    const recommendations = [];
    if (completionRate < 50) {
      const beginnerCourses = await Course.find({
        difficulty: "Beginner",
        _id: { $nin: enrolledCourseIds },
        isPublished: true,
      }).limit(3);
      recommendations.push({
        type: "BEGINNER_COURSES",
        message: "Your completion rate is below 50%. Try these beginner-friendly courses:",
        courses: beginnerCourses,
      });
    }
    if (daysSinceActive >= 7) {
      recommendations.push({
        type: "INACTIVITY_REMINDER",
        message: `You haven't been active for ${daysSinceActive} days. Jump back in!`,
        courses: [],
      });
    }
    // Recommend courses in categories already being studied
    const studiedCategories = await Progress.aggregate([
      { $match: { studentId } },
      { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
      { $unwind: "$course" },
      { $group: { _id: "$course.category" } },
    ]);
    if (studiedCategories.length > 0) {
      const cats = studiedCategories.map((c) => c._id);
      const relatedCourses = await Course.find({
        category: { $in: cats },
        _id: { $nin: enrolledCourseIds },
        isPublished: true,
      }).limit(3);
      if (relatedCourses.length > 0) {
        recommendations.push({
          type: "RELATED_COURSES",
          message: "Based on your interests, you might like:",
          courses: relatedCourses,
        });
      }
    }

    res.json({ success: true, completionRate, daysSinceActive, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
