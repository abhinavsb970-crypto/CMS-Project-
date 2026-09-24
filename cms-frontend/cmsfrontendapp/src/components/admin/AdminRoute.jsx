import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;