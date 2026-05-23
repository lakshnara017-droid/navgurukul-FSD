import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const loggedUser = await login(email, password);
      if (loggedUser.role === "mentor") navigate("/mentor/dashboard");
      else if (loggedUser.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-violet-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50/75 to-cyan-100 flex items-center justify-center p-6 relative overflow-hidden animate-in">
      {/* Soft background orbs */}
      <div className="fixed top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-violet-200/50 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-cyan-200/50 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-violet-50/70 border border-violet-100 rounded-3xl backdrop-blur-md shadow-card p-8 relative z-10">
        {/* Logo & Heading */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-base shadow-glow">
              N
            </div>
            <span className="font-bold text-violet-955 text-sm">NavGurukul</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-violet-955 tracking-tight">Welcome Back</h2>
          <p className="text-violet-450 text-xs mt-1 font-bold">Sign in to your learning dashboard</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 mt-2 text-sm"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-violet-400 mt-6 font-bold">
          Powered by{" "}
          <span className="text-violet-600 font-extrabold">NavGurukul</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
