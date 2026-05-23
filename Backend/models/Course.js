const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Web Development", "Data Science", "Mobile", "DevOps", "AI/ML", "Design", "Other"],
      default: "Other",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // total minutes
      default: 0,
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: true,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
