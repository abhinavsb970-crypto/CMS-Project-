import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getUpcomingAppointments
} from "../../api/doctorApi";


function UpcomingAppointments() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        async function loadAppointments() {

            try {

                setLoading(true);
                setError("");

                const data = await getUpcomingAppointments();

                // Backend may return:
                // 1. an array
                // 2. { results: [...] }
                setAppointments(
                    Array.isArray(data)
                        ? data
                        : data?.results || []
                );

            } catch (err) {

                console.error(
                    "UPCOMING APPOINTMENTS ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load upcoming appointments."
                );

            } finally {

                setLoading(false);

            }
        }

        loadAppointments();

    }, []);


    function formatTime(time) {

        if (!time) {
            return "";
        }

        const [
            hour,
            minute
        ] = time.split(":");

        const date = new Date();

        date.setHours(Number(hour));
        date.setMinutes(Number(minute));

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    return (

        <div className="min-vh-100 bg-light">

            <div className="container py-4">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    className="btn btn-link text-dark text-decoration-none px-0 mb-3"
                    onClick={() => navigate(-1)}
                >

                    <i className="bi bi-arrow-left fs-5 me-2"></i>

                    Back

                </button>


                {/* PAGE HEADER */}

                <div className="card border-0 shadow-sm">

                    <div className="card-header bg-primary text-white py-3">

                        <h3 className="text-center mb-0 fw-bold">

                            <i className="bi bi-calendar-event me-2"></i>

                            UPCOMING APPOINTMENTS

                        </h3>

                    </div>


                    <div className="card-body">


                        {/* LOADING */}

                        {loading && (

                            <div className="text-center py-5">

                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>

                                <div className="mt-2">
                                    Loading appointments...
                                </div>

                            </div>

                        )}


                        {/* ERROR */}

                        {!loading && error && (

                            <div className="alert alert-danger">

                                <i className="bi bi-exclamation-triangle me-2"></i>

                                {error}

                            </div>

                        )}


                        {/* NO APPOINTMENTS */}

                        {!loading &&
                            !error &&
                            appointments.length === 0 && (

                                <div className="alert alert-info">

                                    <i className="bi bi-info-circle me-2"></i>

                                    No upcoming appointments found.

                                </div>

                            )}


                        {/* APPOINTMENTS TABLE */}

                        {!loading &&
                            !error &&
                            appointments.length > 0 && (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover align-middle">

                                        <thead className="table-light">

                                            <tr>

                                                <th>Token</th>

                                                <th>PID</th>

                                                <th>Date</th>

                                                <th>Time</th>

                                                <th>Patient Name</th>

                                                <th>Status</th>

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

                                                        <td>

                                                            <span className="badge bg-primary">

                                                                {
                                                                    appointment.token_number
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    appointment.patient_id
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            {
                                                                formatDate(
                                                                    appointment.appointment_date
                                                                )
                                                            }

                                                        </td>


                                                        <td>

                                                            <i className="bi bi-clock me-2 text-muted"></i>

                                                            {
                                                                formatTime(
                                                                    appointment.appointment_time
                                                                )
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                appointment.patient_name
                                                            }

                                                        </td>


                                                        <td>

                                                            <span className="badge bg-secondary">

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

            </div>

        </div>

    );
}


export default UpcomingAppointments;