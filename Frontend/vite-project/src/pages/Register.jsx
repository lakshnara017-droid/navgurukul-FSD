import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "mentor") navigate("/mentor/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const registeredUser = await register({ name, email, password, role });
      if (registeredUser.role === "mentor") navigate("/mentor/dashboard");
      else if (registeredUser.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try a different email.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07061a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07061a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md glass p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-lg font-black shadow-glow">
              N
            </div>
            <span className="font-bold text-white text-sm">NavGurukul</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-white/40 text-xs mt-1">Join the progressive learning ecosystem</p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500 focus:bg-white/[0.08] transition-all duration-200"
              placeholder="Narasimha Rao"
            />
          </div>

          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500 focus:bg-white/[0.08] transition-all duration-200"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500 focus:bg-white/[0.08] transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Account Type / Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["student", "mentor", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all duration-200
                    ${role === r
                      ? "bg-violet-500/20 border-violet-500 text-violet-300"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-primary py-3 rounded-xl font-bold text-sm shadow-glow mt-4 flex items-center justify-center"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/40 mt-6 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
