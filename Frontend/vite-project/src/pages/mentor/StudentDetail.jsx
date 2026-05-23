import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import TrendChart from "../../charts/TrendChart";
import CertificateModal from "../../components/CertificateModal";
import { mentorAPI } from "../../api";

const StudentDetail = () => {
  const { id: studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certModalData, setCertModalData] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await mentorAPI.getStudent(studentId);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve student's curriculum records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();

    const handleLessonCompleted = () => {
      fetchStudentData();
    };
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        <p className="text-violet-400 text-xs font-semibold">Loading student profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold inline-block mb-4">
          ⚠️ {error || "Student not found"}
        </div>
        <br />
        <Link to="/mentor/students" className="btn btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">
          Back to Cohort
        </Link>
      </div>
    );
  }

  const { student, courseProgress, recentActivities, timeSeries } = data;

  const handleExportFullReport = () => {
    let csvContent = `Student Profile: ${student.name} (${student.email})\n\n`;

    // Section 1: Course Progress
    csvContent += "--- ENROLLED COURSE PROGRESS ---\n";
    if (courseProgress && courseProgress.length > 0) {
      const courseHeaders = ["Course Title", "Category", "Status", "Completion %", "Completed Lessons", "Total Lessons", "Time Spent (Hours)"];
      csvContent += courseHeaders.join(",") + "\n";
      const courseRows = courseProgress.map(item => {
        const timeHours = (item.timeSpent / 60).toFixed(1);
        return `"${item.course.title.replace(/"/g, '""')}","${item.course.category}","${item.status}","${item.progressPercent}%","${item.completedLessons}","${item.totalLessons}","${timeHours}"`;
      });
      csvContent += courseRows.join("\n") + "\n\n";
    } else {
      csvContent += "No courses enrolled.\n\n";
    }

    // Section 2: Learning Log
    csvContent += "--- STUDENT LEARNING LOG ---\n";
    if (recentActivities && recentActivities.length > 0) {
      const logHeaders = ["Date", "Time", "Action", "Target"];
      csvContent += logHeaders.join(",") + "\n";
      const logRows = recentActivities.map(act => {
        const dateObj = new Date(act.createdAt);
        const date = dateObj.toLocaleDateString();
        const time = dateObj.toLocaleTimeString();
        let action = act.type;
        let target = "";
        
        if (act.type === "LESSON_COMPLETED") { action = "Completed Lesson"; target = act.lessonId?.title || ""; }
        else if (act.type === "LESSON_STARTED") { action = "Started Lesson"; target = act.lessonId?.title || ""; }
        else if (act.type === "COURSE_STARTED") { action = "Enrolled Course"; target = act.courseId?.title || ""; }
        else if (act.type === "COURSE_COMPLETED") { action = "Graduated Course"; target = act.courseId?.title || ""; }
        
        return `"${date}","${time}","${action}","${target.replace(/"/g, '""')}"`;
      });
      csvContent += logRows.join("\n") + "\n";
    } else {
      csvContent += "No learning logs found.\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${student.name.replace(/\\s+/g, "_")}_full_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregate stats
  const totalCourses = courseProgress.length;
  const completedLessons = courseProgress.reduce((acc, curr) => acc + curr.completedLessons, 0);
  const totalTimeSpent = courseProgress.reduce((acc, curr) => acc + curr.timeSpent, 0);
  const totalLessons = courseProgress.reduce((acc, curr) => acc + curr.totalLessons, 0);
  const averageProgress = totalCourses
    ? Math.round(courseProgress.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalCourses)
    : 0;

  // Format trend data for chart
  // Trend chart expects {_id: Date, totalTimeSpent: X, completedCount: Y}
  // The API timeSeries is [{date: "2026-05-23", minutes: 30}]
  const formattedTimeSeries = timeSeries.map((t) => ({
    _id: t.date,
    totalTimeSpent: t.minutes,
    completedCount: 1, // dummy value to prevent crash
  }));

  return (
    <div className="space-y-6 animate-in">
      {/* Navigation and header */}
      <div className="flex items-center gap-3">
        <Link to="/mentor/students" className="btn-secondary text-xs px-3.5 py-2 rounded-xl">
          ◀ Back to Cohort
        </Link>
        <div>
          <h2 className="text-xl font-black text-violet-955">Student Progress Review</h2>
          <p className="text-violet-400 text-[10px] uppercase font-bold tracking-wider">Detailed view of {student.name}</p>
        </div>
      </div>

      {/* Profile summary banner */}
      <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-glow">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-violet-955 font-bold text-lg leading-normal">{student.name}</h3>
            <p className="text-violet-455 text-xs font-bold mt-0.5">{student.email}</p>
            <span className="text-[10px] text-violet-400 font-semibold block mt-1.5">
              Account created: {new Date(student.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExportFullReport}
            className="btn-secondary text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 border border-violet-200 shadow-sm hover:shadow-md transition-all h-fit self-center"
          >
            <span>📥</span> Export Full Report
          </button>
          
          <div className="p-3 bg-orange-100/50 border border-orange-200 rounded-xl flex items-center gap-2.5">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-orange-700 font-extrabold text-xs">{student.streak || 0} Day Streak</p>
              <p className="text-orange-500 text-[9px] font-bold">Active learning daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Courses Enrolled"
          value={totalCourses}
          icon="📚"
          color="violet"
        />
        <StatCard
          title="Average Progress"
          value={`${averageProgress}%`}
          icon="📈"
          color="cyan"
        />
        <StatCard
          title="Completed Lessons"
          value={`${completedLessons} / ${totalLessons}`}
          icon="✅"
          color="emerald"
        />
        <StatCard
          title="Study Time"
          value={`${(totalTimeSpent / 60).toFixed(1)}h`}
          icon="🕒"
          color="amber"
        />
      </div>

      {/* Charts & Progress Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Study Trend */}
          <TrendChart data={formattedTimeSeries} />

          {/* Enrolled Courses Progress */}
          <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-violet-955 font-bold text-base flex items-center gap-2">
                <span>📋</span> Enrolled Course Progress
              </h3>
            </div>

            {courseProgress.length === 0 ? (
              <p className="text-violet-400 text-xs py-4 text-center font-bold">Student has not started any courses.</p>
            ) : (
              <div className="space-y-4">
                {courseProgress.map((item) => (
                  <div key={item.course._id} className="p-4 rounded-xl bg-violet-100/30 border border-violet-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-violet-900 text-xs font-extrabold">{item.course.title}</h4>
                        <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-wider block mt-0.5">{item.course.category}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize
                        ${item.status === "Completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-250 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="w-full h-1.5 bg-violet-100/60 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${item.progressPercent}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-violet-850 flex-shrink-0 w-8 text-right">{item.progressPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-violet-400 font-bold">
                      <span>Lessons: {item.completedLessons} / {item.totalLessons}</span>
                      <div className="flex items-center gap-3">
                        <span>Total Time: {(item.timeSpent / 60).toFixed(1)}h</span>
                        {item.status === "Completed" && (
                          <button
                            onClick={() => setCertModalData({
                              courseTitle: item.course.title,
                              completionDate: item.updatedAt || new Date().toISOString(),
                            })}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded border border-amber-300 transition shadow-sm flex items-center gap-1"
                          >
                            <span>🎖️</span> Issue Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent activities log */}
        <div>
          <div className="bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-violet-955 font-bold text-base flex items-center gap-2">
                <span>⚡</span> Student Learning Log
              </h3>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-violet-400 text-xs py-4 text-center font-bold">No learning logs found.</p>
            ) : (
              <div className="relative pl-3 border-l border-violet-100 space-y-5">
                {recentActivities.map((act) => (
                  <div key={act._id} className="relative group text-xs">
                    <div className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-violet-50
                      ${act.type === "LESSON_COMPLETED" ? "bg-emerald-500" : act.type === "COURSE_STARTED" ? "bg-violet-500" : "bg-cyan-500"}`}
                    />
                    <div>
                      <p className="text-violet-900 font-bold">
                        {act.type === "LESSON_COMPLETED" && `Completed: ${act.lessonId?.title}`}
                        {act.type === "LESSON_STARTED" && `Started: ${act.lessonId?.title}`}
                        {act.type === "COURSE_STARTED" && `Enrolled: ${act.courseId?.title}`}
                        {act.type === "COURSE_COMPLETED" && `Graduated: ${act.courseId?.title} 🎓`}
                      </p>
                      <span className="text-[9px] text-violet-400 font-bold mt-0.5 block">
                        {new Date(act.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {certModalData && (
        <CertificateModal
          isOpen={true}
          onClose={() => setCertModalData(null)}
          studentName={student.name}
          courseTitle={certModalData.courseTitle}
          completionDate={certModalData.completionDate}
        />
      )}
    </div>
  );
};

export default StudentDetail;
