import { Outlet, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Staff", path: "/admin/staff" },
  { label: "Departments", path: "/admin/departments" },
  { label: "Medicines", path: "/admin/medicines" },
  { label: "Lab Tests", path: "/admin/lab-tests" },
];

const pageTitles = {
  "/admin": { title: "Admin Dashboard", subtitle: "Clinic Management System" },
  "/admin/staff": {
    title: "Staff Management",
    subtitle: "Manage clinic staff members",
  },
  "/admin/departments": {
    title: "Department Management",
    subtitle: "Manage clinic departments and their active status",
  },
  "/admin/medicines": {
    title: "Medicine Management",
    subtitle: "Manage the clinic medicine master list",
  },
  "/admin/lab-tests": {
    title: "Lab Test Management",
    subtitle: "Manage the clinic lab test master list",
  },
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }
  const username = user.username || "Admin";

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const current = pageTitles[location.pathname] || pageTitles["/admin"];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>CMS</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{current.title}</h1>
            <p>{current.subtitle}</p>
          </div>
          <div className="admin-user">
            <span>{username}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
