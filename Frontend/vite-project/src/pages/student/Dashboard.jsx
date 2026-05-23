import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import ActivityFeed from "../../components/ActivityFeed";
import RecommendationPanel from "../../components/RecommendationPanel";
import TrendChart from "../../charts/TrendChart";
import DonutChart from "../../charts/DonutChart";
import { analyticsAPI } from "../../api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [distData, setDistData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [resStats, resTrend, resDist, resAct, resRecs] = await Promise.all([
        analyticsAPI.getProgress(),
        analyticsAPI.getTimeSeries(7),
        analyticsAPI.getDistribution(),
        analyticsAPI.getActivity(1),
        analyticsAPI.getRecommendations(),
      ]);
      setStats(resStats.data);
      setTrendData(Array.isArray(resTrend.data) ? resTrend.data : []);
      setDistData(Array.isArray(resDist.data) ? resDist.data : []);
      setActivities(Array.isArray(resAct.data) ? resAct.data : []);
      setRecs(Array.isArray(resRecs.data) ? resRecs.data : []);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const handleLessonCompleted = () => {
      fetchAll();
    };
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
        <p className="text-violet-400 text-xs font-semibold">Loading your workspace...</p>
      </div>
    );
  }

  const totalCourses    = stats?.enrolledCourses ?? 0;
  const avgProgress     = stats?.completionRate ?? 0;
  const completedLessons = stats?.completedLessons ?? 0;
  const totalTimeSpent  = stats?.totalTimeSpent ?? 0;

  const activeCourse = distData.find((course) => course.progressPercent < 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-violet-950">Student Dashboard</h2>
          <p className="text-violet-400 text-xs font-bold mt-0.5">Here's an overview of your learning progress</p>
        </div>
        <button
          onClick={fetchAll}
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

      {/* Continue Learning Banner */}
      {activeCourse && (
        <div className="bg-gradient-to-r from-violet-600 to-cyan-500 p-6 rounded-2xl text-white shadow-glow flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in">
          <div className="space-y-2 flex-1">
            <span className="bg-white/20 border border-white/30 text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
              🎯 Continue Learning
            </span>
            <h3 className="text-xl font-black">{activeCourse.courseName}</h3>
            <p className="text-white/85 text-xs font-semibold">
              Category: <span className="capitalize">{activeCourse.category}</span> · You completed {activeCourse.completedLessons} of {activeCourse.totalLessons} lessons
            </p>
            {/* Custom progress indicator */}
            <div className="flex items-center gap-3 pt-2 max-w-md">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: `${activeCourse.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold">{Math.round(activeCourse.progressPercent)}%</span>
            </div>
          </div>
          <Link
            to={`/course/${activeCourse._id}`}
            className="btn bg-white hover:bg-violet-50 text-violet-700 hover:text-violet-850 px-6 py-3 rounded-xl text-xs font-extrabold shadow-md hover:shadow-violet-200 transition-all whitespace-nowrap self-start md:self-auto"
          >
            Resume Course →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Courses"      value={totalCourses}                    icon="📚" change="+1 this week" color="violet" />
        <StatCard title="Overall Progress"    value={`${avgProgress.toFixed(0)}%`}    icon="📈" change="+4% this week" color="cyan" />
        <StatCard title="Lessons Completed"   value={completedLessons}                icon="✅" change="+8 lessons"    color="emerald" />
        <StatCard title="Study Hours"         value={`${(totalTimeSpent/60).toFixed(1)}h`} icon="🕒" change="+2.4h"   color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TrendChart data={trendData} />
        <DonutChart data={distData} />
      </div>

      {/* Feed & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>
        <div>
          <RecommendationPanel recommendations={recs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
