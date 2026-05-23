import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout & Route Guards
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentEnrolledCourses from "./pages/student/EnrolledCourses";
import StudentCourseDetail from "./pages/student/CourseDetail";
import StudentProfile from "./pages/student/Profile";

// Mentor Pages
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorStudents from "./pages/mentor/Students";
import MentorStudentDetail from "./pages/mentor/StudentDetail";
import MentorCertifications from "./pages/mentor/Certifications";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUpload from "./pages/admin/Upload";

// Redirect component for joint "/analytics" navbar link
const AnalyticsRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "mentor") return <Navigate to="/mentor/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["student"]}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["student"]}>
                  <DashboardLayout>
                    <StudentCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrolled-courses"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["student"]}>
                  <DashboardLayout>
                    <StudentEnrolledCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["student"]}>
                  <DashboardLayout>
                    <StudentCourseDetail />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["student"]}>
                  <DashboardLayout>
                    <StudentProfile />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Mentor Protected Routes */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["mentor", "admin"]}>
                  <DashboardLayout>
                    <MentorDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/students"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["mentor", "admin"]}>
                  <DashboardLayout>
                    <MentorStudents />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/student/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["mentor", "admin"]}>
                  <DashboardLayout>
                    <MentorStudentDetail />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor/certifications"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["mentor", "admin"]}>
                  <DashboardLayout>
                    <MentorCertifications />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <DashboardLayout>
                    <AdminUpload />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Analytics Route Helper */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsRedirect />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
