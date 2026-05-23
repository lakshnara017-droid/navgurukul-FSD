import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import { adminAPI } from "../../api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
      setRecentLogs(res.data.recentActivity || []);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    const handleLessonCompleted = () => {
      fetchAdminStats();
    };
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        <p className="text-violet-400 text-xs font-semibold">Loading platform controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-violet-955 leading-tight">Admin Console</h2>
          <p className="text-violet-400 text-xs font-bold mt-1">Review broad platform statistics and recent audit trails.</p>
        </div>
        <button
          onClick={fetchAdminStats}
          className="btn-secondary text-xs px-4 py-2 self-start"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon="👥"
          color="violet"
        />
        <StatCard
          title="Total Mentors"
          value={stats?.totalMentors || 0}
          icon="👨‍🏫"
          color="cyan"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon="📚"
          color="emerald"
        />
        <StatCard
          title="Total Lessons"
          value={stats?.totalLessons || 0}
          icon="📖"
          color="amber"
        />
        <StatCard
          title="Audit Trail Logs"
          value={stats?.totalActivities || 0}
          icon="⚡"
          color="rose"
        />
      </div>

      {/* Activity logs / Audit Trails list */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md shadow-sm">
          <h3 className="text-violet-955 font-bold text-base mb-5 flex items-center gap-2">
            <span>🛡️</span> Security & Learning Audit Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-violet-100/60 text-[10px] uppercase font-black tracking-wider text-violet-500 bg-violet-100/40">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 pr-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100/50 text-xs text-violet-900">
                {recentLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-violet-100/35 transition-colors">
                    <td className="p-4 pl-6 font-bold text-violet-900">
                      {log.userId?.name || "System Automated"}
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border
                        ${log.userId?.role === "admin"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : log.userId?.role === "mentor"
                            ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                            : "bg-violet-100 border-violet-200 text-violet-700"
                        }`}
                      >
                        {log.userId?.role || "System"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-violet-950">
                      {log.type?.replace("_", " ")}
                    </td>
                    <td className="p-4 text-violet-750 font-semibold italic max-w-xs truncate">
                      {log.courseId?.title || log.metadata?.lessonTitle || JSON.stringify(log.metadata) || "No extra metadata"}
                    </td>
                    <td className="p-4 pr-6 text-right font-bold text-violet-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-violet-400 text-xs font-bold">
                      No system events logged today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
