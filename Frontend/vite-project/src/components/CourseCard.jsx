import React from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, progress = 0, isEnrolled = false }) => {
  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 flex flex-col h-full group">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-violet-100/30">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-100 to-cyan-100/40 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 bg-violet-100/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-violet-750 border border-violet-200/50 uppercase tracking-wider shadow-sm">
          {course.category || "General"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-violet-950 font-bold text-sm leading-snug group-hover:text-violet-750 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-violet-800/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-violet-400">Progress</span>
              <span className="text-violet-700">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-violet-100/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-violet-100/50 text-[11px] text-violet-400 font-medium">
            <div className="flex items-center gap-1">
              <span>📖</span>
              <span>{course.totalLessons || 0} Lessons</span>
            </div>
            {course.mentorId && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-violet-200 flex items-center justify-center text-[8px] text-violet-750 font-bold">
                  {course.mentorId.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <span className="truncate max-w-[80px] text-violet-900">{course.mentorId.name || "Mentor"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-4 pb-4">
        <Link
          to={`/course/${course._id}${progress === 100 ? "?action=quiz" : ""}`}
          className="btn-primary w-full text-xs py-2.5 rounded-xl"
        >
          {progress === 100 ? "Completed Course 🚀" : isEnrolled ? "Enrolled →" : "Enroll Course"}
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
