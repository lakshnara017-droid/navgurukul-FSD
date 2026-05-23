import React, { useState, useEffect } from "react";
import { certificatesAPI } from "../../api";

const Certifications = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "pending") {
        const res = await certificatesAPI.getPending();
        setPending(res.data.pending);
      } else {
        const res = await certificatesAPI.getGenerated();
        setGenerated(res.data.certificates);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleGenerate = async (studentId, courseId) => {
    try {
      await certificatesAPI.generate(studentId, courseId);
      alert("Certificate generated successfully! It has been moved to the Generated tab.");
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificate.");
    }
  };

  return (
    <div className="space-y-6 animate-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-violet-955">Certifications</h2>
          <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mt-1">Manage Student Course Completions</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-violet-100">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "pending" ? "border-violet-600 text-violet-700" : "border-transparent text-violet-400 hover:text-violet-600"
          }`}
        >
          ⏳ Ready for Generation
        </button>
        <button
          onClick={() => setActiveTab("generated")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "generated" ? "border-violet-600 text-violet-700" : "border-transparent text-violet-400 hover:text-violet-600"
          }`}
        >
          ✅ Generated Certificates
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
        </div>
      ) : activeTab === "pending" ? (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="p-8 text-center bg-violet-50/50 rounded-2xl border border-violet-100">
              <span className="text-3xl mb-2 block">🎉</span>
              <p className="text-violet-500 font-bold">No pending certificates to generate. All caught up!</p>
            </div>
          ) : (
            pending.map((item, idx) => (
              <div key={idx} className="p-5 bg-white border border-violet-100 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-violet-900 font-bold">{item.student.name}</h4>
                  <p className="text-xs text-violet-400 font-semibold">{item.student.email}</p>
                  <p className="text-xs text-cyan-700 font-bold mt-1">Course: {item.course.title}</p>
                </div>
                <button
                  onClick={() => handleGenerate(item.student._id, item.course._id)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs shadow-glow flex items-center gap-2"
                >
                  <span>🎖️</span> Generate Certificate
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {generated.length === 0 ? (
            <div className="p-8 text-center bg-violet-50/50 rounded-2xl border border-violet-100 col-span-2">
              <p className="text-violet-500 font-bold">No generated certificates yet.</p>
            </div>
          ) : (
            generated.map((cert) => (
              <div key={cert._id} className="p-5 bg-gradient-to-br from-violet-50 to-cyan-50 border border-violet-100 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10">🎓</div>
                <h4 className="text-violet-900 font-bold text-sm">{cert.studentId?.name}</h4>
                <p className="text-xs font-bold text-cyan-700 truncate mb-2">{cert.courseId?.title}</p>
                <div className="flex justify-between items-center text-[10px] text-violet-500 font-semibold border-t border-violet-100 pt-2">
                  <span>Issued By: {cert.issuedBy?.name}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${cert.status === "Claimed" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                    {cert.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Certifications;
