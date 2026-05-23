import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50/75 to-cyan-100 flex flex-col relative overflow-hidden animate-in">
      {/* Subtle background shapes */}
      <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-200/50 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-200/50 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-base shadow-glow">
            N
          </div>
          <div>
            <p className="font-bold text-violet-955 text-sm leading-none">NavGurukul</p>
            <p className="text-[9px] text-violet-500 uppercase tracking-widest mt-0.5 font-bold">Learning Hub</p>
          </div>
        </div>
        <Link to="/login" className="btn-primary text-xs px-5 py-2">
          Sign In →
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto z-10 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-xs font-bold text-violet-750 mb-6 shadow-sm">
          🚀 Empowering the Next Generation of Full Stack Developers
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-violet-955">
          Accelerate Your Learning.{" "}
          <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
            Track Your Progress.
          </span>
        </h1>

        <p className="text-violet-850 font-bold text-base md:text-lg max-w-2xl leading-relaxed mb-10">
          Welcome to the NavGurukul Progressive Dashboard — a role-aware learning platform with rich analytics,
          automated progress tracking, mentor reviews, and administrative controls.
        </p>

        <Link to="/login" className="btn-primary px-8 py-3.5 text-sm rounded-2xl shadow-lg">
          Get Started →
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 w-full text-left">
          {[
            { icon: "📊", title: "Detailed Analytics",      desc: "Track daily learning hours, streaks, and progress distribution across all courses." },
            { icon: "👥", title: "Mentor-Led Reviews",      desc: "Mentors get actionable insights on student bottlenecks and can export progress reports." },
            { icon: "📤", title: "Bulk Administration",     desc: "Admins upload students, courses, and progress via Excel files with inline error previews." },
          ].map((f) => (
            <div key={f.title} className="bg-violet-50/70 border border-violet-100 rounded-2xl backdrop-blur-md p-6 hover:shadow-md hover:border-violet-300 transition-all duration-300 shadow-sm">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-violet-950 font-black text-sm mb-2">{f.title}</h3>
              <p className="text-violet-500 text-xs leading-relaxed font-bold">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-violet-400 text-[10px] font-black tracking-wider border-t border-violet-100 max-w-6xl mx-auto w-full">
        © {new Date().getFullYear()} NAVGURUKUL LEARNING HUB. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default Landing;
