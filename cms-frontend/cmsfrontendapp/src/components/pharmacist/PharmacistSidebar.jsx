import { useNavigate } from "react-router-dom";

function PharmacistSidebar({
  activePage,
  setActivePage,
}) {

  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "inventory",
      label: "Medicine Inventory",
    },
    {
      id: "stock-history",
      label: "Stock History",
    },
    {
      id: "allotment",
      label: "Allot Medicine",
    },
    {
      id: "billing",
      label: "Pharmacy Billing",
    },
    {
      id: "reports",
      label: "Sales Reports",
    },
  ];

  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Go back to login page
    navigate("/");
  };

  return (
    <aside className="pharmacist-sidebar">

      <div className="sidebar-header">
        <h2>Pharmacy</h2>

        <p>Clinic Management System</p>
      </div>

      <div className="sidebar-menu">

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={
              activePage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}

        {/* Logout button */}
        <button
          type="button"
          className="sidebar-item logout-item"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>

      </div>

    </aside>
  );
}

export default PharmacistSidebar;