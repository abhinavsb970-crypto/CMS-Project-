import { NavLink, useNavigate } from 'react-router-dom'

function Sidebar() {

  const navigate = useNavigate()

  const handleLogout = () => {

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <div className="sidebar">

      <div className="sidebar-brand">

        <h4>
          Clinic System
        </h4>

        <small>
          Receptionist
        </small>

      </div>

      <nav className="sidebar-nav">

        <NavLink
          to="/receptionist"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          👤 Patient Management
        </NavLink>

        <NavLink
          to="/appointments/schedule"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          📅 Schedule Appointment
        </NavLink>

        <NavLink
          to="/appointments/list"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          📋 Appointment Listing
        </NavLink>

        <NavLink
          to="/consultation"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          🩺 Consultation
        </NavLink>

        <NavLink
          to="/billing"
          className={({ isActive }) =>
            isActive
              ? 'nav-item active'
              : 'nav-item'
          }
        >
          💰 Billing
        </NavLink>

      </nav>

      <div className="sidebar-bottom">

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </div>

    </div>
  )
}

export default Sidebar