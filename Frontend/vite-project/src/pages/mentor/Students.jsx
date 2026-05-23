import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mentorAPI } from "../../api";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const res = await mentorAPI.getStudents();
      setStudents(res.data.students || res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve cohort student roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
  }, []);

  const handleCSVExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const res = await mentorAPI.exportStudents();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_progress_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export student CSV report.");
    } finally {
      setExporting(false);
    }
  };

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Header and export controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-violet-955 leading-tight">Student Cohort</h2>
          <p className="text-violet-400 text-xs font-bold mt-1">Review active streaks, course progress, and individual statistics.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-violet-50/50 border border-violet-200/80 text-violet-955 placeholder-violet-400/80 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
            />
            <span className="absolute left-3.5 top-3 text-violet-450 text-xs">🔍</span>
          </div>

          <button
            onClick={handleCSVExport}
            disabled={exporting}
            className="btn btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-glow flex items-center justify-center gap-2"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />
            ) : (
              "📤 Export CSV"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
          <p className="text-violet-400 text-xs font-semibold">Fetching roster...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-violet-200/50 bg-violet-50/20 rounded-2xl">
          <span className="text-4xl mb-4 block">👥</span>
          <h3 className="text-violet-950 font-bold text-base mb-1">No Students Found</h3>
          <p className="text-violet-450 text-xs font-bold">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="bg-violet-50/70 border border-violet-100 rounded-2xl backdrop-blur-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-violet-100/60 text-[10px] uppercase font-black tracking-wider text-violet-500 bg-violet-100/40">
                  <th className="p-4 pl-6">Student Info</th>
                  <th className="p-4">Daily Streak</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100/50">
                {filtered.map((student) => (
                  <tr key={student._id} className="hover:bg-violet-100/35 transition-colors duration-150">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center font-bold text-xs text-violet-750">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-violet-900 text-xs font-bold leading-normal">{student.name}</p>
                          <p className="text-violet-500/70 text-[10px] font-semibold mt-0.5">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-xs text-orange-600">
                      <span className="bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">🔥 {student.streak || 0} Days</span>
                    </td>
                    <td className="p-4 text-violet-800/80 text-xs font-bold">
                      {new Date(student.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        to={`/mentor/student/${student._id}`}
                        className="px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 hover:text-violet-850 border border-violet-200 rounded-lg text-[10px] font-bold transition-all duration-150 inline-block"
                      >
                        View Profile ➜
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
