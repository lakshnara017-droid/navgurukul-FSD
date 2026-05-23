import React from "react";

const ActivityFeed = ({ activities = [] }) => {
  const getIcon = (type) => {
    const icons = {
      LESSON_COMPLETED: "✅",
      COURSE_STARTED:   "🚀",
      COURSE_COMPLETED: "🎓",
      LOGIN:            "🔑",
      STREAK_STRIKE:    "🔥",
      REGISTER:         "🎉",
    };
    return icons[type] || "✨";
  };

  const getTheme = (type) => {
    switch (type) {
      case "LESSON_COMPLETED":  return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "COURSE_STARTED":    return "bg-violet-100 text-violet-700 border-violet-200";
      case "COURSE_COMPLETED":  return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "LOGIN":             return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "STREAK_STRIKE":     return "bg-orange-100 text-orange-700 border-orange-200";
      default:                  return "bg-violet-100/50 text-violet-600 border-violet-200/50";
    }
  };

  const getDot = (type) => {
    switch (type) {
      case "LESSON_COMPLETED":  return "bg-emerald-450";
      case "COURSE_STARTED":    return "bg-violet-500";
      case "COURSE_COMPLETED":  return "bg-indigo-500";
      case "LOGIN":             return "bg-cyan-450";
      default:                  return "bg-violet-400";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-violet-50/70 backdrop-blur-md rounded-2xl border border-violet-100 shadow-sm p-6">
      <h3 className="text-violet-950 font-bold text-sm mb-5 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs">⚡</span>
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-violet-400 text-xs">No recent activities found.</p>
        </div>
      ) : (
        <div className="relative pl-4 border-l-2 border-violet-100 space-y-5">
          {activities.slice(0, 6).map((activity) => (
            <div key={activity._id} className="relative group">
              <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-violet-50 ${getDot(activity.type)}`} />

              <div className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm flex-shrink-0 ${getTheme(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-violet-950 text-xs font-bold leading-snug">
                    {activity.metadata?.lessonTitle || activity.metadata?.courseTitle || activity.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-violet-500/70 text-[10px] mt-0.5 font-semibold">
                    {activity.type === "LESSON_COMPLETED"  && "Completed lesson"}
                    {activity.type === "COURSE_STARTED"    && "Started new course"}
                    {activity.type === "COURSE_COMPLETED"  && "Course completed!"}
                    {activity.type === "LOGIN"             && "Logged in"}
                    {activity.type === "STREAK_STRIKE"     && "Streak extended"}
                  </p>
                </div>
                <span className="text-[10px] text-violet-450 font-semibold flex-shrink-0 mt-0.5">
                  {formatDate(activity.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
