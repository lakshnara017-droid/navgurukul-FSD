import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const redirect = user.role === "admin" ? "/admin/dashboard" : user.role === "mentor" ? "/mentor/dashboard" : "/dashboard";
    return <Navigate to={redirect} replace />;
  }
  return children;
};

export default RoleRoute;
