import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { coursesAPI, lessonsAPI, certificatesAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import QuizModal from "../../components/QuizModal";
import CertificateModal from "../../components/CertificateModal";

/* ─── PDF Viewer Component ──────────────────────────────────────────────── */
const PdfViewer = ({ url }) => {
  // Supports Google Drive, Cloudinary, and direct .pdf URLs
  let embedUrl = url;
  if (url.includes("drive.google.com")) {
    embedUrl = url.replace("/view", "/preview").replace("/edit", "/preview");
  } else if (url.toLowerCase().endsWith(".pdf")) {
    // Proxy direct PDF links through our backend to permanently bypass X-Frame-Options & CSP
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    embedUrl = `${baseUrl.replace('/api', '')}/api/proxy/pdf?url=${encodeURIComponent(url)}`;
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-violet-200/60 shadow-glow bg-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-cyan-50 border-b border-violet-100">
        <span className="text-base">📄</span>
        <span className="text-xs font-bold text-violet-700">PDF Document</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={embedUrl}
        title="Lesson PDF"
        className="w-full"
        style={{ height: "70vh", border: "none" }}
        allow="autoplay"
      />
    </div>
  );
};

/* ─── Main CourseDetail Page ─────────────────────────────────────────────── */
const CourseDetail = () => {
  const { id: courseId } = useParams();
  const location = useLocation();
  const { updateUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("content"); // 'content' | 'pdf'

  // Lesson player states
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const timerRef = useRef(null);
  const syncedMinutesRef = useRef(0);

  // Certificate logic
  const [certStatus, setCertStatus] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCert, setShowCert] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const res = await coursesAPI.getById(courseId);
      const fetchedLessons = res.data.lessons || [];
      const fetchedProgress = res.data.progressData || [];
      setCourse(res.data.course);
      setLessons(fetchedLessons);
      setProgressData(fetchedProgress);

      // Auto-open first incomplete lesson (Continue Learning)
      const firstIncomplete = fetchedLessons.find(
        (l) => !fetchedProgress.find((p) => p.lessonId === l._id && p.completed)
      );
      if (firstIncomplete) setActiveLesson(firstIncomplete);
    } catch (err) {
      console.error(err);
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const checkCert = async () => {
      try {
        const completedCount = progressData.filter((p) => p.completed).length;
        if (lessons.length > 0 && completedCount === lessons.length) {
          const res = await certificatesAPI.getMyStatus(courseId);
          setCertStatus(res.data.certificate);

          // Auto-open quiz if action=quiz is in URL and certificate is generated
          const params = new URLSearchParams(location.search);
          if (params.get("action") === "quiz" && res.data.certificate?.status === "Generated") {
            setShowQuiz(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (progressData.length > 0 && lessons.length > 0) {
      checkCert();
    }
  }, [progressData, lessons, location.search]);

  // Handle active lesson timer
  useEffect(() => {
    if (activeLesson) {
      const prog = progressData.find((p) => p.lessonId === activeLesson._id);
      setIsCompleted(prog ? prog.completed : false);
      setActiveTab(activeLesson.pdfUrl ? "pdf" : "content");

      lessonsAPI.start(activeLesson._id).catch(console.error);

      setTimeSpent(0);
      syncedMinutesRef.current = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => {
          const newTime = prev + 1;
          if (newTime % 60 === 0) {
            lessonsAPI.updateTime(activeLesson._id, 1).catch(console.error);
            syncedMinutesRef.current += 1;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeLesson]);

  const handleMarkComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      const totalMins = Math.max(1, Math.round(timeSpent / 60));
      const minsToSync = Math.max(0, totalMins - syncedMinutesRef.current);
      const res = await lessonsAPI.complete(activeLesson._id, minsToSync);
      if (res.data.success) {
        setIsCompleted(true);
        const newProgData = [...progressData];
        const idx = newProgData.findIndex((p) => p.lessonId === activeLesson._id);
        if (idx > -1) newProgData[idx] = res.data.progress;
        else newProgData.push(res.data.progress);
        setProgressData(newProgData);

       if (res.data.streak !== undefined) {
           const userStr = localStorage.getItem("user");
           if (userStr) {
             const userObj = JSON.parse(userStr);
             userObj.streak = res.data.streak;
             updateUser(userObj);
           }
         }
         // Dispatch event to update dashboards
         window.dispatchEvent(new Event('lessonCompleted'));
       }
     } catch (err) {
       console.error(err);
       alert("Failed to mark lesson completed.");
     } finally {
       setCompleting(false);
     }
   };

  const handleNextLesson = () => {
    const idx = lessons.findIndex((l) => l._id === activeLesson._id);
    if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1]);
  };

  const handlePrevLesson = () => {
    const idx = lessons.findIndex((l) => l._id === activeLesson._id);
    if (idx > 0) setActiveLesson(lessons[idx - 1]);
  };

  const getLessonProgress = (lessonId) =>
    progressData.find((p) => p.lessonId === lessonId);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
        <p className="text-violet-400 text-xs font-semibold">Loading curriculum...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold inline-block mb-4">
          ⚠️ {error || "Course not found"}
        </div>
        <br />
        <Link to="/courses" className="btn btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">
          Back to Library
        </Link>
      </div>
    );
  }

  const completedCount = progressData.filter((p) => p.completed).length;
  const progressPercent = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const lessonTypeIcon = (type, hasPdf) => {
    if (hasPdf) return "📄";
    if (type === "video") return "🎬";
    if (type === "quiz") return "❓";
    if (type === "assignment") return "📝";
    return "📖";
  };

  const activeIdx = activeLesson
    ? lessons.findIndex((l) => l._id === activeLesson._id)
    : -1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-in">
      {/* ── Curriculum Sidebar ─────────────────────────────────────────── */}
      <div className="lg:col-span-1 bg-gradient-to-b from-violet-50/90 to-cyan-50/60 border border-violet-100 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-5 max-h-[calc(100vh-120px)] overflow-y-auto sticky top-[90px]">
        {/* Course title */}
        <div>
          <h3 className="text-violet-950 font-extrabold text-sm leading-snug line-clamp-2">
            {course.title}
          </h3>
          <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block mt-1">
            {course.category}
          </span>
        </div>

        {/* Progress gauge */}
        <div className="p-3 bg-white/70 border border-violet-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
            <span className="text-violet-600">Your progress</span>
            <span className="text-violet-800">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-violet-100/60 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              }}
            />
          </div>
          <p className="text-[10px] text-violet-400 font-bold mt-1 uppercase tracking-widest">{completedCount} of {lessons.length} Lessons</p>
        </div>

        {/* Certificate Section */}
        {progressPercent === 100 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-violet-100 flex flex-col gap-2">
            {!certStatus ? (
              <p className="text-xs text-violet-500 font-bold text-center">Course completed! Waiting for Mentor to generate your certificate.</p>
            ) : certStatus.status === "Generated" ? (
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-bold py-2 rounded-xl text-xs shadow-glow transition flex items-center justify-center gap-2"
              >
                <span>🚀</span> Claim Your Certificate
              </button>
            ) : certStatus.status === "Claimed" ? (
              <button
                onClick={() => setShowCert(true)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>🎓</span> View Certificate
              </button>
            ) : null}
          </div>
        )}

        {/* Overview button */}
        <button
          onClick={() => setActiveLesson(null)}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2
            ${!activeLesson
              ? "bg-violet-600 text-white shadow-glow"
              : "text-violet-700 hover:bg-violet-100/60 border border-transparent hover:border-violet-200"
            }`}
        >
          📋 Course Overview
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">

        {/* Step-by-step lesson list */}
        <div>
          <p className="text-[10px] text-violet-400 uppercase tracking-widest font-black px-1 mb-2">
            📚 Curriculum · {lessons.length} Topics
          </p>
          <div className="space-y-1.5">
            {lessons.map((lesson, idx) => {
              const prog = getLessonProgress(lesson._id);
              const isDone = prog?.completed;
              const isActive = activeLesson?._id === lesson._id;
              const hasPdf = !!lesson.pdfUrl;

              return (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-start gap-2.5 border
                    ${isActive
                      ? "bg-white border-violet-300 shadow-sm text-violet-900"
                      : isDone
                        ? "bg-emerald-50/60 border-emerald-100 text-emerald-800 hover:bg-emerald-50"
                        : "bg-transparent hover:bg-violet-50/60 text-violet-800 border-transparent hover:border-violet-100"
                    }`}
                >
                  {/* Step number / checkmark */}
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border mt-0.5
                      ${isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                          ? "bg-violet-600 border-violet-600 text-white"
                          : "bg-violet-100/60 border-violet-200 text-violet-500"
                      }`}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold leading-normal">
                      {lessonTypeIcon(lesson.type, hasPdf)} {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-violet-400 font-medium">
                        🕒 {lesson.duration} min
                      </span>
                      {hasPdf && (
                        <span className="text-[9px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">
                          PDF
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-5">
        {!activeLesson ? (
          /* ── Course Overview ────────────────────────────────────── */
          <div className="bg-white/80 border border-violet-100 p-8 rounded-2xl backdrop-blur-md shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-violet-100/60 pb-6">
              <div>
                <span className="text-xs bg-violet-100 border border-violet-200 text-violet-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {course.category}
                </span>
                <h2 className="text-3xl font-black text-violet-950 mt-4">{course.title}</h2>
                <p className="text-violet-700/80 text-sm mt-3 leading-relaxed max-w-2xl font-medium">
                  {course.description}
                </p>
              </div>
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full sm:w-48 aspect-video rounded-xl object-cover border border-violet-100 shadow-glow"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: "📊", label: "Difficulty", value: course.difficulty || "Beginner" },
                { icon: "🕒", label: "Duration", value: `${course.duration || "N/A"} Hours` },
                { icon: "👥", label: "Instructor", value: course.mentorId?.name || "NavGurukul Mentor" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 bg-gradient-to-br from-violet-50 to-cyan-50/50 border border-violet-100 rounded-xl">
                  <span className="text-xl">{stat.icon}</span>
                  <p className="text-violet-400 text-[10px] uppercase font-bold tracking-wider mt-2">{stat.label}</p>
                  <p className="text-violet-900 text-sm font-bold capitalize mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {course.mentorId && (
              <div className="p-5 bg-gradient-to-r from-violet-50 to-cyan-50 border border-violet-100 rounded-2xl flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                  {course.mentorId.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-violet-950 text-xs font-extrabold">{course.mentorId.name}</h4>
                  <p className="text-violet-500 text-[10px] font-semibold mt-0.5">
                    {course.mentorId.bio || "Full Stack Developer at NavGurukul."}
                  </p>
                </div>
              </div>
            )}

            {/* Lesson summary table */}
            {lessons.length > 0 && (
              <div>
                <h3 className="text-sm font-extrabold text-violet-950 mb-3">📋 All Topics ({lessons.length})</h3>
                <div className="divide-y divide-violet-100/60 border border-violet-100 rounded-xl overflow-hidden">
                  {lessons.map((lesson, idx) => {
                    const prog = getLessonProgress(lesson._id);
                    const isDone = prog?.completed;
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => setActiveLesson(lesson)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50/60 transition text-left"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
                          ${isDone ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-500"}`}>
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-violet-900 truncate">
                            {lessonTypeIcon(lesson.type, !!lesson.pdfUrl)} {lesson.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lesson.pdfUrl && (
                            <span className="text-[9px] bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">PDF</span>
                          )}
                          <span className="text-[10px] text-violet-400 font-semibold">{lesson.duration} min</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              <Link to="/courses" className="btn-secondary text-xs px-5 py-2.5 rounded-xl font-bold">
                ← Back to Library
              </Link>
              {lessons.length > 0 && (
                <button
                  onClick={() => {
                    const firstIncomplete = lessons.find(
                      (l) => !getLessonProgress(l._id)?.completed
                    );
                    setActiveLesson(firstIncomplete || lessons[0]);
                  }}
                  className="btn btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow"
                >
                  {completedCount > 0 ? "▶ Continue Learning" : "🚀 Start First Lesson"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Active Lesson Viewer ───────────────────────────────── */
          <div className="space-y-4">
            {/* Lesson Header Card */}
            <div className="bg-white/90 border border-violet-100 px-6 py-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="text-[10px] font-bold text-violet-500 hover:text-violet-700 transition flex items-center gap-1 uppercase tracking-wider mb-1"
                >
                  ◀ Course Curriculum
                </button>
                <h2 className="text-lg font-extrabold text-violet-950 leading-snug">
                  {lessonTypeIcon(activeLesson.type, !!activeLesson.pdfUrl)} {activeLesson.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-violet-400 font-semibold">
                    Topic {activeIdx + 1} of {lessons.length}
                  </span>
                  {activeLesson.pdfUrl && (
                    <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-2 py-0.5 rounded-full">PDF Lesson</span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ Completed</span>
                  )}
                </div>
              </div>
              {/* Timer */}
              <div className="flex items-center gap-2 bg-violet-50 border border-violet-200/60 px-3.5 py-2 rounded-full text-xs text-violet-700 font-bold flex-shrink-0">
                <span>🕒</span>
                <span>Active: <strong className="text-cyan-700">{formatTime(timeSpent)}</strong></span>
              </div>
            </div>

            {/* Tab bar (only if lesson has both content and PDF) */}
            {activeLesson.pdfUrl && activeLesson.content && (
              <div className="flex gap-2">
                {[
                  { id: "pdf", label: "📄 PDF Lesson" },
                  { id: "content", label: "📖 Notes" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border
                      ${activeTab === tab.id
                        ? "bg-violet-600 text-white border-violet-600 shadow-glow"
                        : "bg-white text-violet-600 border-violet-200 hover:bg-violet-50"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            {activeLesson.pdfUrl && activeTab === "pdf" ? (
              <PdfViewer url={activeLesson.pdfUrl} />
            ) : (
              <div className="bg-white/90 border border-violet-100 p-6 rounded-2xl shadow-sm min-h-[320px] leading-relaxed text-sm text-violet-900 whitespace-pre-wrap select-text font-medium">
                {activeLesson.content ? (
                  <div>{activeLesson.content}</div>
                ) : (
                  <div className="text-center py-16">
                    <span className="text-4xl block mb-3">📝</span>
                    <p className="text-violet-400 text-xs font-semibold">
                      No text content attached to this lesson.
                    </p>
                    {activeLesson.pdfUrl && (
                      <button
                        onClick={() => setActiveTab("pdf")}
                        className="mt-4 btn btn-primary text-xs px-5 py-2 rounded-xl"
                      >
                        📄 View PDF instead
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer: Mark Complete + Navigation */}
            <div className="bg-white/90 border border-violet-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Mark Complete */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleted || completing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border
                    ${isCompleted
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                      : completing
                        ? "bg-violet-50 border-violet-200 text-violet-500 cursor-wait"
                        : "bg-violet-600 border-violet-600 text-white hover:bg-violet-700 shadow-glow cursor-pointer"
                    }`}
                >
                  {isCompleted ? (
                    <><span>🎉</span> Lesson Completed!</>
                  ) : completing ? (
                    <><div className="animate-spin rounded-full h-3 w-3 border-t-2 border-violet-400" /> Saving...</>
                  ) : (
                    <><span>✅</span> Mark as Completed</>
                  )}
                </button>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  disabled={activeIdx <= 0}
                  onClick={handlePrevLesson}
                  className="px-4 py-2.5 bg-violet-50 hover:bg-violet-100 disabled:opacity-30 rounded-xl text-xs font-bold text-violet-700 border border-violet-200 transition"
                >
                  ◀ Previous
                </button>
                <button
                  disabled={activeIdx >= lessons.length - 1}
                  onClick={handleNextLesson}
                  className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-30 rounded-xl text-xs font-bold text-white shadow-glow transition"
                >
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        courseId={courseId}
        onSuccess={() => {
          setShowQuiz(false);
          setCertStatus({ ...certStatus, status: "Claimed" });
          setShowCert(true);
        }}
      />

      {certStatus && (
        <CertificateModal
          isOpen={showCert}
          onClose={() => setShowCert(false)}
          studentName={useAuth().user?.name}
          courseTitle={course.title}
          completionDate={certStatus.updatedAt}
        />
      )}
    </div>
  );
};

export default CourseDetail;
