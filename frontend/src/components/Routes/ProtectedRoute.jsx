import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />; // prevents back navigation
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
