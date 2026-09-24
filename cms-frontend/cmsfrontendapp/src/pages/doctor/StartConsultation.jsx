import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getStartConsultationAppointments,
    startConsultation
} from "../../api/doctorApi";


function StartConsultation() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [startingId, setStartingId] = useState(null);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadAppointments() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getStartConsultationAppointments();

                /*
                 * Backend can return:
                 *
                 * [
                 *   {...},
                 *   {...}
                 * ]
                 *
                 * OR
                 *
                 * {
                 *   results: [...]
                 * }
                 */

                setAppointments(
                    Array.isArray(data)
                        ? data
                        : data?.results || []
                );

            } catch (err) {

                console.error(
                    "START CONSULTATION ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load patients."
                );

            } finally {

                setLoading(false);

            }

        }

        loadAppointments();

    }, []);


    async function handleStart(appointment) {

        try {

            setStartingId(
                appointment.appointment_id
            );

            setError("");

            /*
             * Tell backend that this appointment
             * has started consultation.
             *
             * Backend changes:
             *
             * SCHEDULED
             *       ↓
             * IN_CONSULTATION
             */

            await startConsultation(
                appointment.appointment_id
            );


            /*
             * After successfully starting the
             * consultation, open the Patient File.
             */

            navigate(
                `/doctor/patient/${appointment.appointment_id}`
            );

        } catch (err) {

            console.error(
                "START CONSULTATION ERROR:",
                err
            );

            setError(
                err.message ||
                "Unable to start consultation."
            );

        } finally {

            setStartingId(null);

        }

    }


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


                {/* MAIN CARD */}

                <div className="card border-0 shadow-sm">

                    {/* HEADER */}

                    <div className="card-header bg-primary text-white py-3">

                        <h3 className="text-center mb-0 fw-bold">

                            <i className="bi bi-play-circle me-2"></i>

                            START CONSULTATION

                        </h3>

                    </div>


                    <div className="card-body">


                        {/* ERROR */}

                        {error && (

                            <div className="alert alert-danger">

                                <i className="bi bi-exclamation-triangle me-2"></i>

                                {error}

                            </div>

                        )}


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
                                    Loading patients...
                                </div>

                            </div>

                        )}


                        {/* NO PATIENTS */}

                        {!loading &&
                            !error &&
                            appointments.length === 0 && (

                                <div className="alert alert-info">

                                    <i className="bi bi-info-circle me-2"></i>

                                    No patients are waiting for consultation.

                                </div>

                            )}


                        {/* APPOINTMENTS */}

                        {!loading &&
                            !error &&
                            appointments.length > 0 && (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover align-middle">

                                        <thead className="table-light">

                                            <tr>

                                                <th>
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

                                                <th>
                                                    Action
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

                                                        {/* TOKEN */}

                                                        <td>

                                                            <span className="badge bg-primary">

                                                                {
                                                                    appointment.token_number
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* PATIENT ID */}

                                                        <td>

                                                            <strong>
                                                                {
                                                                    appointment.patient_id
                                                                }
                                                            </strong>

                                                        </td>


                                                        {/* TIME */}

                                                        <td>

                                                            <i className="bi bi-clock me-2 text-muted"></i>

                                                            {
                                                                formatTime(
                                                                    appointment.appointment_time
                                                                )
                                                            }

                                                        </td>


                                                        {/* PATIENT NAME */}

                                                        <td>

                                                            {
                                                                appointment.patient_name
                                                            }

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    appointment.status ===
                                                                    "IN_CONSULTATION"
                                                                        ? "badge bg-warning text-dark"
                                                                        : "badge bg-primary"
                                                                }
                                                            >

                                                                {
                                                                    appointment.status
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-sm"
                                                                disabled={
                                                                    startingId ===
                                                                    appointment.appointment_id
                                                                }
                                                                onClick={() =>
                                                                    handleStart(
                                                                        appointment
                                                                    )
                                                                }
                                                            >

                                                                {startingId ===
                                                                appointment.appointment_id
                                                                    ? (
                                                                        <>
                                                                            <span
                                                                                className="spinner-border spinner-border-sm me-2"
                                                                                role="status"
                                                                            ></span>

                                                                            Starting...
                                                                        </>
                                                                    )
                                                                    : (
                                                                        <>
                                                                            <i className="bi bi-play-fill me-1"></i>

                                                                            Start Consultation
                                                                        </>
                                                                    )}

                                                            </button>

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


export default StartConsultation;