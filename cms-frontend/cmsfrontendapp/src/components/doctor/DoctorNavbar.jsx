import { Link, useNavigate } from "react-router-dom";

function DoctorNavbar() {

    const navigate = useNavigate();

    // Get logged-in user details
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        // Remove login information
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Go back to login page
        navigate("/");
    };

    return (
        <nav className="navbar navbar-dark bg-primary shadow-sm">

            <div className="container-fluid">

                <Link
                    to="/doctor"
                    className="navbar-brand fw-bold"
                >
                    <i className="bi bi-hospital me-2"></i>
                    Clinic Management System
                </Link>

                <div className="d-flex align-items-center">

                    <span className="text-white me-4">
                        <i className="bi bi-person-circle me-2"></i>
                        Dr. {user?.first_name || "Doctor"}
                    </span>

                    <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default DoctorNavbar;