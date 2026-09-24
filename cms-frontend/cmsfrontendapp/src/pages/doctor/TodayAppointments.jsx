import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DoctorNavbar from "../../components/doctor/DoctorNavbar";

function TodayAppointments() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchTodayAppointments = async () => {

            try {

                setLoading(true);
                setError("");

                // Get JWT access token saved during login
                const token = localStorage.getItem("accessToken");

                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }


                // Get today's appointments from Doctor API
                const response = await fetch(
                    "http://127.0.0.1:8000/api/doctor/appointments/today/",
                    {
                        method: "GET",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    if (response.status === 401) {
                        throw new Error(
                            "Session expired. Please login again."
                        );
                    }

                    if (response.status === 403) {
                        throw new Error(
                            "You do not have permission to view today's appointments."
                        );
                    }

                    throw new Error(
                        "Failed to load today's appointments."
                    );
                }


                setAppointments(data);

            } catch (error) {

                console.error(
                    "TODAY APPOINTMENTS ERROR:",
                    error
                );

                setError(error.message);

            } finally {

                setLoading(false);

            }

        };


        fetchTodayAppointments();

    }, []);


    return (
        <div className="min-vh-100 bg-light">

            {/* Navbar */}

            <DoctorNavbar />


            <div className="container py-5">

                {/* Page Header */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h2 className="fw-bold mb-1">
                            Today's Appointments
                        </h2>

                        <p className="text-muted mb-0">
                            View your appointments scheduled for today.
                        </p>

                    </div>


                    <div>

                        <span className="badge bg-primary fs-6 px-3 py-2">

                            <i className="bi bi-calendar3 me-2"></i>

                            Today's Appointments

                        </span>

                    </div>

                </div>


                {/* Loading */}

                {loading && (

                    <div className="card border-0 shadow-sm">

                        <div className="card-body text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                            </div>

                            <p className="text-muted mt-3 mb-0">
                                Loading today's appointments...
                            </p>

                        </div>

                    </div>

                )}


                {/* Error */}

                {!loading && error && (

                    <div className="alert alert-danger shadow-sm">

                        <i className="bi bi-exclamation-triangle me-2"></i>

                        {error}

                    </div>

                )}


                {/* Appointments */}

                {!loading && !error && (

                    <div className="card border-0 shadow-sm">

                        <div className="card-body p-0">

                            {appointments.length === 0 ? (

                                /* No appointments */

                                <div className="text-center py-5">

                                    <i className="bi bi-calendar-x display-4 text-muted"></i>

                                    <h5 className="mt-3">
                                        No Appointments Today
                                    </h5>

                                    <p className="text-muted">
                                        You don't have any appointments
                                        scheduled for today.
                                    </p>

                                </div>

                            ) : (

                                /* Appointment Table */

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">

                                        <thead className="table-light">

                                            <tr>

                                                <th className="px-4">
                                                    Token
                                                </th>

                                                <th>
                                                    PID
                                                </th>

                                                <th>
                                                    Time
                                                </th>

                                                <th>
                                                    Patient Name
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {appointments.map(
                                                (appointment) => (

                                                    <tr
                                                        key={
                                                            appointment.appointment_id
                                                        }
                                                    >

                                                        {/* Token */}

                                                        <td className="px-4">

                                                            <span className="badge bg-primary rounded-pill">

                                                                {
                                                                    appointment.token_number
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* Patient ID */}

                                                        <td>

                                                            <strong>
                                                                {
                                                                    appointment.patient_id
                                                                }
                                                            </strong>

                                                        </td>


                                                        {/* Time */}

                                                        <td>

                                                            <i className="bi bi-clock me-2 text-muted"></i>

                                                            {
                                                                appointment.appointment_time
                                                            }

                                                        </td>


                                                        {/* Patient Name */}

                                                        <td>

                                                            <div className="d-flex align-items-center">

                                                                <div
                                                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "40px"
                                                                    }}
                                                                >

                                                                    {appointment.patient_name
                                                                        ? appointment.patient_name
                                                                            .charAt(0)
                                                                            .toUpperCase()
                                                                        : "P"}

                                                                </div>


                                                                <div>

                                                                    <div className="fw-semibold">

                                                                        {
                                                                            appointment.patient_name
                                                                        }

                                                                    </div>


                                                                    <small className="text-muted">

                                                                        Patient ID:{" "}

                                                                        {
                                                                            appointment.patient_id
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* Status */}

                                                        <td>

                                                            <span className="badge bg-success-subtle text-success px-3 py-2">

                                                                <i className="bi bi-check-circle me-1"></i>

                                                                {
                                                                    appointment.status
                                                                }

                                                            </span>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* Back Button */}

                <button
                    className="btn btn-outline-secondary mt-4"
                    onClick={() => navigate(-1)}
                >

                    <i className="bi bi-arrow-left me-2"></i>

                    Back

                </button>

            </div>

        </div>
    );
}

export default TodayAppointments;