import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentNav = [
  { to: "/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/courses",   icon: "📚", label: "Courses" },
  { to: "/enrolled-courses", icon: "🎓", label: "Enrolled Courses" },
  { to: "/profile",   icon: "👤", label: "Profile" },
];
const MentorNav = [
  { to: "/mentor/dashboard", icon: "⊞",  label: "Dashboard" },
  { to: "/mentor/students",  icon: "👥", label: "Students" },
  { to: "/mentor/certifications", icon: "🎓", label: "Certifications" },
];
const AdminNav = [
  { to: "/admin/dashboard", icon: "⊞",  label: "Dashboard" },
  { to: "/admin/upload",    icon: "📤", label: "Upload Data" },
  { to: "/mentor/students", icon: "👥", label: "Students" },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems =
    user?.role === "mentor" ? MentorNav :
    user?.role === "admin"  ? AdminNav  : StudentNav;

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleTag =
    user?.role === "mentor" ? "bg-cyan-100/70 text-cyan-700 border-cyan-200" :
    user?.role === "admin"  ? "bg-orange-100/70 text-orange-700 border-orange-200" :
                              "bg-violet-100/70 text-violet-700 border-violet-200";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          bg-violet-50/95 border-r border-violet-100 shadow-sm backdrop-blur-md`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-violet-100/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-base shadow-glow-sm">
              N
            </div>
            <div>
              <p className="font-bold text-violet-950 text-sm leading-none">NavGurukul</p>
              <p className="text-[9px] text-violet-500 uppercase tracking-widest mt-0.5">Learning Hub</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-100/40 border border-violet-100/60">
            <div className="w-9 h-9 rounded-full bg-violet-200 text-violet-750 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-violet-950 text-sm font-semibold truncate">{user?.name}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${roleTag}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="text-base">{icon}</span>
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Streak (students) */}
        {user?.role === "student" && user?.streak > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-100/50 border border-orange-200">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-orange-700 font-bold text-sm">{user.streak} Day Streak</p>
                <p className="text-orange-500 text-[10px] font-medium">Keep it up!</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-violet-100/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500
              hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 text-sm font-medium"
          >
            <span>🚪</span><span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-violet-100/60 bg-violet-50/70 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-violet-500 hover:text-violet-700 p-1.5 rounded-lg hover:bg-violet-100/50 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-violet-400 text-[10px] font-medium">{greeting},</p>
          <p className="text-violet-955 font-semibold text-sm leading-none mt-0.5">{user?.name} 👋</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
