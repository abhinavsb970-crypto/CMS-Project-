import { Link } from "react-router-dom";
import DoctorNavbar from "../../components/doctor/DoctorNavbar";

function DoctorDashboard() {

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const doctorName = user.first_name || user.username || "Doctor";

    return (
        <div className="min-vh-100 bg-light">

            <DoctorNavbar />

            <div className="container py-5">

                {/* Welcome section */}

                <div className="mb-5">

                    <h1 className="fw-bold">
                        Welcome, Dr. {doctorName}! 👋
                    </h1>

                    <p className="text-muted fs-5">
                        Have a nice day. Here's your clinic overview.
                    </p>

                </div>

                {/* Dashboard cards */}

                <div className="row g-4">

                    {/* Today's Appointments */}

                    <div className="col-md-6 col-lg-4">

                        <Link
                            to="/doctor/today"
                            className="text-decoration-none"
                        >

                            <div className="card border-0 shadow-sm h-100">

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between align-items-start">

                                        <div>

                                            <h5 className="fw-bold text-dark">
                                                Today's Appointments
                                            </h5>

                                            <p className="text-muted">
                                                View patients scheduled for today.
                                            </p>

                                        </div>

                                        <div className="fs-1 text-primary">
                                            <i className="bi bi-calendar-check"></i>
                                        </div>

                                    </div>

                                    <button className="btn btn-primary mt-3">
                                        View Appointments
                                    </button>

                                </div>

                            </div>

                        </Link>

                    </div>

                    {/* Upcoming Appointments */}

                    <div className="col-md-6 col-lg-4">

                        <Link
                            to="/doctor/upcoming"
                            className="text-decoration-none"
                        >

                            <div className="card border-0 shadow-sm h-100">

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between">

                                        <div>

                                            <h5 className="fw-bold text-dark">
                                                Upcoming Appointments
                                            </h5>

                                            <p className="text-muted">
                                                View appointments scheduled for upcoming days.
                                            </p>

                                        </div>

                                        <div className="fs-1 text-success">
                                            <i className="bi bi-calendar-event"></i>
                                        </div>

                                    </div>

                                    <button className="btn btn-success mt-3">
                                        View Upcoming
                                    </button>

                                </div>

                            </div>

                        </Link>

                    </div>

                    {/* Start Consultation */}

                    <div className="col-md-6 col-lg-4">

                        <Link
                            to="/doctor/consultation"
                            className="text-decoration-none"
                        >

                            <div className="card border-0 shadow-sm h-100">

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between">

                                        <div>

                                            <h5 className="fw-bold text-dark">
                                                Start Consultation
                                            </h5>

                                            <p className="text-muted">
                                                Start consultation for today's patients.
                                            </p>

                                        </div>

                                        <div className="fs-1 text-danger">
                                            <i className="bi bi-clipboard2-pulse"></i>
                                        </div>

                                    </div>

                                    <button className="btn btn-danger mt-3">
                                        Start Consultation
                                    </button>

                                </div>

                            </div>

                        </Link>

                    </div>

                    {/* Consultation History */}

                    <div className="col-md-6 col-lg-4">

                        <Link
                            to="/doctor/history"
                            className="text-decoration-none"
                        >

                            <div className="card border-0 shadow-sm h-100">

                                <div className="card-body p-4">

                                    <div className="d-flex justify-content-between">

                                        <div>

                                            <h5 className="fw-bold text-dark">
                                                Consultation History
                                            </h5>

                                            <p className="text-muted">
                                                Search and view previous consultations.
                                            </p>

                                        </div>

                                        <div className="fs-1 text-warning">
                                            <i className="bi bi-clock-history"></i>
                                        </div>

                                    </div>

                                    <button className="btn btn-warning mt-3">
                                        View History
                                    </button>

                                </div>

                            </div>

                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DoctorDashboard;