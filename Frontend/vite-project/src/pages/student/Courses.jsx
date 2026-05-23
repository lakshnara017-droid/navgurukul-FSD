import React, { useState, useEffect } from "react";
import CourseCard from "../../components/CourseCard";
import { coursesAPI, progressAPI } from "../../api";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [enrolledMap, setEnrolledMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCourses, resProgress] = await Promise.all([
        coursesAPI.getAll(),
        progressAPI.getMy(),
      ]);

      const resCoursesData = Array.isArray(resCourses.data?.courses)
        ? resCourses.data.courses
        : Array.isArray(resCourses.data)
          ? resCourses.data
          : [];

      setCourses(resCoursesData);

      const progList = Array.isArray(resProgress.data?.progress)
        ? resProgress.data.progress
        : Array.isArray(resProgress.data)
          ? resProgress.data
          : [];

      // Group lesson progress by course
      const courseProgressMap = {};
      const eMap = {};
      progList.forEach((p) => {
        const cid = p.courseId?._id || p.courseId;
        if (!cid) return;

        eMap[cid] = true;

        if (!courseProgressMap[cid]) {
          courseProgressMap[cid] = { completedLessons: 0 };
        }

        if (p.completed) {
          courseProgressMap[cid].completedLessons += 1;
        }
      });

      // Calculate percentage for each course
      const progMap = {};
      resCoursesData.forEach((course) => {
        const cid = course._id;
        const total = course.totalLessons || 0;
        const comp = courseProgressMap[cid]?.completedLessons || 0;
        progMap[cid] = total > 0 ? Math.round((comp / total) * 100) : 0;
      });

      setProgresses(progMap);
      setEnrolledMap(eMap);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch courses. Please check your backend connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleLessonCompleted = () => {
      fetchData();
    };
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" ||
      course.category?.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter pills
  const categories = [
    "all",
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter bars */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-violet-955 leading-tight">
            Curriculum Library
          </h2>
          <p className="text-violet-400 text-xs font-bold mt-1">
            Explore and enroll in specialized developer courses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-violet-50/50 border border-violet-200/80 text-violet-950 placeholder-violet-400/80 text-xs focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all duration-200"
            />
            <span className="absolute left-3.5 top-3 text-violet-450 text-xs">
              🔍
            </span>
          </div>

          <button
            onClick={fetchData}
            className="btn-secondary text-xs px-4 py-2 flex items-center justify-center gap-2"
          >
            🔄 Sync
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Categories Filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border transition-all duration-200
              ${
                category === cat
                  ? "bg-violet-600 border-violet-600 text-white shadow-glow"
                  : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
          <p className="text-violet-400 text-xs font-semibold">
            Syncing curriculum...
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-violet-200/60 bg-violet-50/20 rounded-2xl">
          <span className="text-4xl mb-4 block">📦</span>
          <h3 className="text-violet-950 font-bold text-base mb-1">
            No Courses Found
          </h3>
          <p className="text-violet-450 text-xs font-semibold">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              progress={progresses[course._id] || 0}
              isEnrolled={enrolledMap[course._id] || false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
