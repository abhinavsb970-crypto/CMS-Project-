import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getPatientFile
} from "../../api/doctorApi";


function PatientFile() {

    const navigate = useNavigate();

    const { appointmentId } =
        useParams();


    const [patient, setPatient] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadPatient() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getPatientFile(
                        appointmentId
                    );

                setPatient(data);

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);

            }

        }

        loadPatient();

    }, [appointmentId]);


    function continueConsultation() {

        navigate(
            `/doctor/consultation/${appointmentId}`
        );

    }


    return (

        <div className="min-vh-100 bg-light">

            <div className="container py-4">

                {/* BACK BUTTON */}

                <button
                    className="btn btn-link text-dark text-decoration-none px-0 mb-3"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <i className="bi bi-arrow-left fs-5 me-2"></i>

                    Back

                </button>


                {/* LOADING */}

                {loading && (

                    <div className="text-center py-5">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        />

                        <div className="mt-2">

                            Loading patient file...

                        </div>

                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {/* PATIENT FILE */}

                {!loading &&
                    !error &&
                    patient && (

                        <div className="card border-0 shadow-sm">

                            {/* HEADER */}

                            <div className="card-header bg-primary text-white py-3">

                                <h3 className="text-center mb-0 fw-bold">

                                    <i className="bi bi-person-vcard me-2"></i>

                                    PATIENT FILE

                                </h3>

                            </div>


                            <div className="card-body">

                                {/* PATIENT DETAILS */}

                                <div className="row g-4">


                                    {/* PATIENT ID */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Patient ID

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.patient_id
                                            }

                                        </div>

                                    </div>


                                    {/* PATIENT NAME */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Patient Name

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.patient_name
                                            }

                                        </div>

                                    </div>


                                    {/* AGE */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Age

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.age
                                            } Years

                                        </div>

                                    </div>


                                    {/* GENDER */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Gender

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.gender
                                            }

                                        </div>

                                    </div>


                                    {/* BLOOD GROUP */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Blood Group

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.blood_group ||
                                                "Not available"
                                            }

                                        </div>

                                    </div>


                                    {/* PHONE */}

                                    <div className="col-md-6">

                                        <div className="text-muted small">

                                            Phone

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.phone
                                            }

                                        </div>

                                    </div>


                                    {/* ADDRESS */}

                                    <div className="col-12">

                                        <div className="text-muted small">

                                            Address

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.address
                                            }

                                        </div>

                                    </div>


                                </div>


                                <hr className="my-4" />


                                {/* CURRENT APPOINTMENT */}

                                <h5 className="fw-bold mb-4">

                                    Current Appointment

                                </h5>


                                <div className="row g-4">


                                    {/* APPOINTMENT ID */}

                                    <div className="col-md-3">

                                        <div className="text-muted small">

                                            Appointment ID

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.appointment_id
                                            }

                                        </div>

                                    </div>


                                    {/* CONSULT DATE */}

                                    <div className="col-md-3">

                                        <div className="text-muted small">

                                            Consult Date

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.consult_date
                                            }

                                        </div>

                                    </div>


                                    {/* TOKEN */}

                                    <div className="col-md-3">

                                        <div className="text-muted small">

                                            Token

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.token_number
                                            }

                                        </div>

                                    </div>


                                    {/* TIME */}

                                    <div className="col-md-3">

                                        <div className="text-muted small">

                                            Time

                                        </div>

                                        <div className="fw-semibold">

                                            {
                                                patient.appointment_time
                                            }

                                        </div>

                                    </div>


                                </div>


                                {/* BUTTONS */}

                                <div className="d-flex gap-2 mt-5 flex-wrap">


                                    {/* MEDICAL HISTORY */}

                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() =>
                                            navigate(
                                                `/doctor/patient/${patient.patient_id}/history`
                                            )
                                        }
                                    >

                                        <i className="bi bi-clock-history me-2"></i>

                                        View Medical History

                                    </button>


                                    {/* CONTINUE CONSULTATION */}

                                    <button
                                        className="btn btn-primary"
                                        onClick={
                                            continueConsultation
                                        }
                                    >

                                        <i className="bi bi-arrow-right-circle me-2"></i>

                                        Continue to Consultation

                                    </button>


                                </div>


                            </div>

                        </div>

                    )}


            </div>

        </div>

    );

}


export default PatientFile;