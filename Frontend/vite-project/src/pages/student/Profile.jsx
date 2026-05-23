import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI, certificatesAPI } from "../../api";
import CertificateModal from "../../components/CertificateModal";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    if (user?.role === "student") {
      certificatesAPI.getMy().then((res) => {
        setCertificates(res.data.certificates);
      }).catch(console.error);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const updateData = { name, email };
      if (password) updateData.password = password;

      const res = await authAPI.updateProfile(updateData);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      <div>
        <h2 className="text-2xl font-black text-violet-900 leading-tight">User Account</h2>
        <p className="text-violet-400 text-xs font-bold mt-1">Configure your personal preferences and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md text-center flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-glow">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-violet-950 font-bold text-base leading-snug">{user?.name}</h3>
            <p className="text-violet-500 text-[11px] font-bold mt-1 truncate max-w-full">{user?.email}</p>
          </div>
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full border bg-violet-100 border-violet-200 text-violet-700 capitalize">
            {user?.role} Account
          </span>

          {user?.streak !== undefined && (
            <div className="w-full mt-4 p-3 bg-orange-100/50 border border-orange-200 rounded-xl flex items-center justify-center gap-2">
              <span className="text-xl">🔥</span>
              <div className="text-left">
                <p className="text-orange-700 font-extrabold text-xs">{user.streak} Day Streak</p>
                <p className="text-orange-400 text-[9px] font-bold">Keep learning daily!</p>
              </div>
            </div>
          )}
        </div>

        {/* Update Form */}
        <div className="md:col-span-2 bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-violet-900 font-bold text-sm mb-4">Edit Profile</h3>

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold">
              ✓ {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-violet-100/40 border border-violet-200 text-violet-950 placeholder-violet-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-violet-100/40 border border-violet-200 text-violet-950 placeholder-violet-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-violet-100/40 border border-violet-200 text-violet-950 placeholder-violet-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-violet-500 text-[10px] font-black uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-violet-100/40 border border-violet-200 text-violet-950 placeholder-violet-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Certificates Section */}
        {user?.role === "student" && (
          <div className="md:col-span-3 bg-violet-50/70 border border-violet-100 p-6 rounded-2xl backdrop-blur-md mt-6">
            <h3 className="text-violet-900 font-bold text-sm mb-4">My Certificates</h3>
            {certificates.length === 0 ? (
              <p className="text-xs text-violet-500 font-medium">You have not claimed any certificates yet. Complete a course and pass the final challenge!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                  <div key={cert._id} className="p-4 bg-white border border-violet-100 rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="text-4xl mb-2">🎓</div>
                    <h4 className="text-violet-900 font-bold text-sm">{cert.courseId?.title}</h4>
                    <p className="text-[10px] text-violet-400 font-semibold mb-3">Issued: {new Date(cert.updatedAt).toLocaleDateString()}</p>
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="w-full bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold py-1.5 rounded-lg text-xs transition"
                    >
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCert && (
        <CertificateModal
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          studentName={user?.name}
          courseTitle={selectedCert.courseId?.title}
          completionDate={selectedCert.updatedAt}
        />
      )}
    </div>
  );
};

export default Profile;
