import React from "react";
import { Link } from "react-router-dom";

const RecommendationPanel = ({ recommendations = [] }) => {
  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-violet-950 font-bold text-sm mb-2 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center text-xs">🎯</span>
        Recommended for You
      </h3>
      <p className="text-violet-500/70 text-xs mb-4 leading-relaxed font-semibold">
        Based on your current learning trajectory:
      </p>

      <div className="flex-1 space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-violet-200/60 rounded-xl">
            <span className="text-2xl mb-2 block">🌟</span>
            <p className="text-violet-400 text-xs font-semibold">Start exploring courses to get personalized recommendations.</p>
          </div>
        ) : (
          recommendations.slice(0, 3).map((course) => (
            <div
              key={course._id}
              className="flex gap-3 p-3 rounded-xl border border-violet-100 hover:border-violet-300 hover:bg-violet-100/50 transition-all duration-200 items-center group bg-violet-100/10"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-200 to-cyan-100/60 flex items-center justify-center text-base flex-shrink-0">
                📚
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-violet-900 text-xs font-bold truncate group-hover:text-violet-750 transition-colors">
                  {course.title}
                </h4>
                <p className="text-violet-450 text-[10px] mt-0.5 capitalize font-semibold">
                  {course.category} · {course.totalLessons} lessons
                </p>
              </div>
              <Link
                to={`/course/${course._id}`}
                className="w-7 h-7 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center text-violet-750 hover:text-violet-850 transition-all duration-200 text-xs font-bold flex-shrink-0"
              >
                →
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-violet-100/60">
        <Link
          to="/courses"
          className="w-full text-center py-2.5 text-xs font-bold text-violet-750 bg-violet-100 hover:bg-violet-200 border border-violet-250 rounded-xl block transition-all duration-200"
        >
          Explore All Courses →
        </Link>
      </div>
    </div>
  );
};

export default RecommendationPanel;
