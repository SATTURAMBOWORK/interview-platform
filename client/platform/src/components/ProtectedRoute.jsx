import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContextValue";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, role } = useContext(AuthContext);

  // 🔑 Wait until role is resolved
  if (token && !role) {
    return <div>Loading...</div>;
  }

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role check ONLY if roles are provided
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Access granted
  return children;
};

export default ProtectedRoute;
