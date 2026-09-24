import { Outlet, useLocation, useNavigate } from "react-router-dom";

import "./LabLayout.css";

const menuItems = [
  { label: "Dashboard", path: "/lab-technician" },

  { label: "Pending Tests", path: "/lab-technician/pending-tests" },

  { label: "Completed Tests", path: "/lab-technician/completed-tests" },

  { label: "Laboratory Reports", path: "/lab-technician/reports" },

  { label: "Laboratory Billing", path: "/lab-technician/billing" },

  { label: "Test Management", path: "/lab-technician/test-management" },
];

const pageTitles = {
  "/lab-technician": {
    title: "Lab Technician Dashboard",
    subtitle: "Clinic Management System",
  },

  "/lab-technician/pending-tests": {
    title: "Pending Lab Tests",
    subtitle: "View and process assigned laboratory tests",
  },

  "/lab-technician/completed-tests": {
    title: "Completed Lab Tests",
    subtitle: "View previously completed laboratory tests",
  },

  "/lab-technician/test-management": {
    title: "Test Management",
    subtitle: "Manage laboratory test master",
  },

  "/lab-technician/reports": {
    title: "Laboratory Reports",
    subtitle: "View and manage generated laboratory reports",
  },

  "/lab-technician/billing": {
    title: "Laboratory Billing",
    subtitle: "Manage laboratory bills and payment records",
  },
};

function LabLayout() {
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

  const username = user.username || "Lab Technician";

  const isActive = (path) => {
    if (path === "/lab-technician") {
      return location.pathname === "/lab-technician";
    }

    return location.pathname.startsWith(path);
  };

  const current =
    pageTitles[location.pathname] || pageTitles["/lab-technician"];

  return (
    <div className="lab-layout">
      {/* Sidebar */}

      <aside className="lab-sidebar">
        <div className="lab-sidebar-header">
          <h2>CMS</h2>
          <p>Lab Technician Panel</p>
        </div>

        <nav className="lab-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`lab-sidebar-item ${
                isActive(item.path) ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="lab-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}

      <main className="lab-main">
        <header className="lab-header">
          <div>
            <h1>{current.title}</h1>
            <p>{current.subtitle}</p>
          </div>

          <div className="lab-user">
            <span>{username}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default LabLayout;
