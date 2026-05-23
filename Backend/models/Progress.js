const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number, // for quizzes
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index — one progress record per student+lesson
progressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
