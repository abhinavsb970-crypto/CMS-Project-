import { Navigate } from "react-router-dom";

function LabRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // No login token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User information is missing
  if (!user) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Only Lab Technician can access this module
  if (user.role !== "LAB_TECHNICIAN") {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    // Other roles are not available yet
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default LabRoute;
