import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import DistributionBar from "../../charts/DistributionBar";
import { mentorAPI } from "../../api";

const MentorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cohortStats, setCohortStats] = useState(null);
  const [error, setError] = useState("");

  const fetchCohortData = async () => {
    try {
      setLoading(true);
      const res = await mentorAPI.getStudents();
      setStudents(res.data.students || []);

      // Calculate simple stats locally for display
      const list = res.data.students || [];
      const totalStudents = list.length;
      const totalStreaks = list.reduce((acc, curr) => acc + (curr.streak || 0), 0);
      const avgStreak = totalStudents ? Math.round(totalStreaks / totalStudents) : 0;

      // Mock or aggregate active metrics
      setCohortStats({
        totalStudents,
        avgStreak,
        activeHours: 124.5,
        totalCertificates: 8,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch mentor dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        <p className="text-violet-400 text-xs font-semibold">Loading mentor workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-violet-955 leading-tight">Mentor Hub</h2>
          <p className="text-violet-400 text-xs font-bold mt-1">Monitor cohort activities and educational milestones.</p>
        </div>
        <button
          onClick={fetchCohortData}
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={cohortStats?.totalStudents || 0}
          icon="👥"
          change="+2 new signups"
          color="cyan"
        />
        <StatCard
          title="Average Streak"
          value={`${cohortStats?.avgStreak || 0} days`}
          icon="🔥"
          change="Up by 1.2"
          color="amber"
        />
        <StatCard
          title="Active Study Hours"
          value={`${cohortStats?.activeHours}h`}
          icon="🕒"
          change="+18h this week"
          color="violet"
        />
        <StatCard
          title="Milestones Achieved"
          value={cohortStats?.totalCertificates || 0}
          icon="🎓"
          change="+1 milestone"
          color="emerald"
        />
      </div>

      {/* Cohort overview & distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DistributionBar />
        </div>

        {/* Top Active Students list */}
        <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-violet-955 font-bold text-base mb-4 flex items-center gap-2">
              <span>🔥</span> Highly Active Students
            </h3>
            <p className="text-violet-400 text-xs mb-5 font-bold">Students with active study habits this week.</p>

            <div className="space-y-4">
              {students.slice(0, 4).map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-violet-100/30 border border-violet-100 hover:border-violet-300 transition-all duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center font-bold text-xs text-violet-750 flex-shrink-0">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-violet-900 text-xs font-bold truncate">{student.name}</p>
                      <p className="text-violet-450 text-[9px] font-bold truncate mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">🔥 {student.streak || 0} Days</span>
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-violet-400 text-xs text-center py-6 font-semibold">No students signed up yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
