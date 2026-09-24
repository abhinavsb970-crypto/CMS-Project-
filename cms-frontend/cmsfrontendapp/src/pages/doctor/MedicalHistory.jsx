import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getMedicalHistory
} from "../../api/doctorApi";


function MedicalHistory() {

    const navigate = useNavigate();

    const {
        patientId
    } = useParams();


    const [history, setHistory] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        selectedConsultation,
        setSelectedConsultation
    ] = useState(null);


    useEffect(() => {

        async function loadHistory() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getMedicalHistory(
                        patientId
                    );

                setHistory(
                    Array.isArray(data)
                        ? data
                        : data?.results || []
                );

            } catch (err) {

                setError(
                    err.message ||
                    "Failed to load medical history."
                );

            } finally {

                setLoading(false);

            }

        }


        if (patientId) {
            loadHistory();
        }

    }, [patientId]);


    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(dateString);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
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


    function formatDateTime(dateString) {

        if (!dateString) {
            return "-";
        }

        const date =
            new Date(dateString);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateString;
        }

        return date.toLocaleString(
            "en-IN"
        );

    }


    function getStatusClass(status) {

        if (!status) {
            return "bg-secondary";
        }

        switch (status) {

            case "COMPLETED":
                return "bg-success";

            case "IN_PROGRESS":
                return "bg-warning text-dark";

            case "PENDING":
                return "bg-info text-dark";

            case "CANCELLED":
                return "bg-danger";

            default:
                return "bg-secondary";

        }

    }


    function formatStatus(status) {

        if (!status) {
            return "NOT ALLOTTED";
        }

        return status.replace(
            /_/g,
            " "
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


                {/* PAGE HEADER */}

                <div className="card border-0 shadow-sm mb-4">

                    <div className="card-header bg-primary text-white py-3">

                        <h3 className="text-center mb-0 fw-bold">

                            <i className="bi bi-clock-history me-2"></i>

                            PATIENT MEDICAL HISTORY

                        </h3>

                    </div>


                    <div className="card-body">

                        <div className="row g-3">

                            <div className="col-md-6">

                                <span className="text-muted small">
                                    Patient ID
                                </span>

                                <div className="fw-semibold">
                                    {patientId}
                                </div>

                            </div>


                            <div className="col-md-6">

                                <span className="text-muted small">
                                    Consultation Records
                                </span>

                                <div className="fw-semibold">
                                    {history.length}
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="card border-0 shadow-sm">

                        <div className="card-body text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            />

                            <div className="mt-2">
                                Loading medical history...
                            </div>

                        </div>

                    </div>

                )}


                {/* ERROR */}

                {!loading &&
                    error && (

                        <div className="alert alert-danger shadow-sm">

                            <i className="bi bi-exclamation-triangle me-2"></i>

                            {error}

                        </div>

                    )}


                {/* NO HISTORY */}

                {!loading &&
                    !error &&
                    history.length === 0 && (

                        <div className="alert alert-info shadow-sm">

                            <i className="bi bi-info-circle me-2"></i>

                            No previous consultation records found
                            for this patient.

                        </div>

                    )}


                {/* HISTORY */}

                {!loading &&
                    !error &&
                    history.length > 0 && (

                        <div className="row">

                            {history.map(
                                (
                                    consultation,
                                    index
                                ) => (

                                    <div
                                        className="col-12 mb-4"
                                        key={
                                            consultation.consultation_id ||
                                            index
                                        }
                                    >

                                        <div className="card border-0 shadow-sm">


                                            {/* CONSULTATION HEADER */}

                                            <div className="card-header bg-white">

                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

                                                    <h5 className="fw-bold mb-0">

                                                        Consultation #

                                                        {
                                                            consultation.consultation_id
                                                        }

                                                    </h5>


                                                    <span className="badge bg-secondary">

                                                        {formatDate(
                                                            consultation.consultation_date
                                                        )}

                                                    </span>

                                                </div>

                                            </div>


                                            <div className="card-body">


                                                {/* SYMPTOMS */}

                                                <div className="mb-4">

                                                    <h6 className="fw-bold">
                                                        Symptoms
                                                    </h6>

                                                    <div className="border rounded p-3 bg-light">

                                                        {
                                                            consultation.symptoms ||
                                                            "No symptoms recorded."
                                                        }

                                                    </div>

                                                </div>


                                                {/* DIAGNOSIS */}

                                                <div className="mb-4">

                                                    <h6 className="fw-bold">
                                                        Diagnosis
                                                    </h6>

                                                    <div className="border rounded p-3 bg-light">

                                                        {
                                                            consultation.diagnosis ||
                                                            "No diagnosis recorded."
                                                        }

                                                    </div>

                                                </div>


                                                {/* DOCTOR NOTES */}

                                                <div className="mb-4">

                                                    <h6 className="fw-bold">
                                                        Doctor Notes
                                                    </h6>

                                                    <div className="border rounded p-3 bg-light">

                                                        {
                                                            consultation.doctor_notes ||
                                                            "No doctor notes."
                                                        }

                                                    </div>

                                                </div>


                                                {/* MEDICINES */}

                                                {consultation.medicines &&
                                                    consultation.medicines.length >
                                                    0 && (

                                                        <div className="mb-4">

                                                            <h6 className="fw-bold">

                                                                <i className="bi bi-capsule me-2"></i>

                                                                Medicines

                                                            </h6>


                                                            <div className="table-responsive">

                                                                <table className="table table-bordered align-middle">

                                                                    <thead className="table-light">

                                                                        <tr>

                                                                            <th>
                                                                                Medicine
                                                                            </th>

                                                                            <th>
                                                                                Frequency
                                                                            </th>

                                                                            <th>
                                                                                Duration
                                                                            </th>

                                                                            <th>
                                                                                Quantity
                                                                            </th>

                                                                            <th>
                                                                                Route
                                                                            </th>

                                                                            <th>
                                                                                Instructions
                                                                            </th>

                                                                        </tr>

                                                                    </thead>


                                                                    <tbody>

                                                                        {consultation.medicines.map(
                                                                            (
                                                                                medicine,
                                                                                medicineIndex
                                                                            ) => (

                                                                                <tr
                                                                                    key={
                                                                                        medicineIndex
                                                                                    }
                                                                                >

                                                                                    <td>
                                                                                        {
                                                                                            medicine.medicine_name
                                                                                        }
                                                                                    </td>

                                                                                    <td>
                                                                                        {
                                                                                            medicine.frequency
                                                                                        }
                                                                                    </td>

                                                                                    <td>

                                                                                        {
                                                                                            medicine.duration
                                                                                        }

                                                                                        {" days"}

                                                                                    </td>

                                                                                    <td>
                                                                                        {
                                                                                            medicine.quantity
                                                                                        }
                                                                                    </td>

                                                                                    <td>
                                                                                        {
                                                                                            medicine.route
                                                                                        }
                                                                                    </td>

                                                                                    <td>
                                                                                        {
                                                                                            medicine.instructions
                                                                                        }
                                                                                    </td>

                                                                                </tr>

                                                                            )
                                                                        )}

                                                                    </tbody>

                                                                </table>

                                                            </div>

                                                        </div>

                                                    )}


                                                {/* NO MEDICINES */}

                                                {(!consultation.medicines ||
                                                    consultation.medicines.length ===
                                                    0) && (

                                                        <div className="mb-4">

                                                            <h6 className="fw-bold">

                                                                <i className="bi bi-capsule me-2"></i>

                                                                Medicines

                                                            </h6>

                                                            <div className="text-muted">

                                                                No medicines prescribed.

                                                            </div>

                                                        </div>

                                                    )}


                                                {/* =====================================================
                                                    LAB TESTS
                                                    ===================================================== */}

                                                {consultation.lab_tests &&
                                                    consultation.lab_tests.length >
                                                    0 && (

                                                        <div className="mb-4">

                                                            <h6 className="fw-bold">

                                                                <i className="bi bi-clipboard2-pulse me-2"></i>

                                                                Laboratory Tests & Results

                                                            </h6>


                                                            <div className="table-responsive">

                                                                <table className="table table-bordered align-middle">

                                                                    <thead className="table-light">

                                                                        <tr>

                                                                            <th>
                                                                                Test
                                                                            </th>

                                                                            <th>
                                                                                Code
                                                                            </th>

                                                                            <th>
                                                                                Price
                                                                            </th>

                                                                            <th>
                                                                                Status
                                                                            </th>

                                                                            <th>
                                                                                Result
                                                                            </th>

                                                                            <th>
                                                                                Technician
                                                                            </th>

                                                                            <th>
                                                                                Report
                                                                            </th>

                                                                        </tr>

                                                                    </thead>


                                                                    <tbody>

                                                                        {consultation.lab_tests.map(
                                                                            (
                                                                                lab,
                                                                                labIndex
                                                                            ) => (

                                                                                <tr
                                                                                    key={
                                                                                        labIndex
                                                                                    }
                                                                                >

                                                                                    {/* TEST */}

                                                                                    <td>

                                                                                        <strong>
                                                                                            {
                                                                                                lab.test_name
                                                                                            }
                                                                                        </strong>

                                                                                    </td>


                                                                                    {/* CODE */}

                                                                                    <td>

                                                                                        {
                                                                                            lab.test_code
                                                                                        }

                                                                                    </td>


                                                                                    {/* PRICE */}

                                                                                    <td>

                                                                                        ₹
                                                                                        {
                                                                                            lab.price
                                                                                        }

                                                                                    </td>


                                                                                    {/* STATUS */}

                                                                                    <td>

                                                                                        <span
                                                                                            className={`badge ${getStatusClass(
                                                                                                lab.status
                                                                                            )}`}
                                                                                        >

                                                                                            {
                                                                                                formatStatus(
                                                                                                    lab.status
                                                                                                )
                                                                                            }

                                                                                        </span>

                                                                                    </td>


                                                                                    {/* RESULT */}

                                                                                    <td>

                                                                                        {lab.result ? (

                                                                                            <div
                                                                                                className="small"
                                                                                                style={{
                                                                                                    whiteSpace:
                                                                                                        "pre-wrap"
                                                                                                }}
                                                                                            >
                                                                                                {
                                                                                                    lab.result
                                                                                                }
                                                                                            </div>

                                                                                        ) : (

                                                                                            <span className="text-muted">

                                                                                                Result not available yet.

                                                                                            </span>

                                                                                        )}

                                                                                    </td>


                                                                                    {/* TECHNICIAN */}

                                                                                    <td>

                                                                                        {lab.technician_name ? (

                                                                                            <div>

                                                                                                <strong>
                                                                                                    {
                                                                                                        lab.technician_name
                                                                                                    }
                                                                                                </strong>

                                                                                                {lab.technician_id && (

                                                                                                    <div className="small text-muted">

                                                                                                        {
                                                                                                            lab.technician_id
                                                                                                        }

                                                                                                    </div>

                                                                                                )}

                                                                                            </div>

                                                                                        ) : (

                                                                                            <span className="text-muted">
                                                                                                -
                                                                                            </span>

                                                                                        )}

                                                                                    </td>


                                                                                    {/* REPORT */}

                                                                                    <td>

                                                                                        {lab.report_id ? (

                                                                                            <div>

                                                                                                <span className="badge bg-success">

                                                                                                    Available

                                                                                                </span>

                                                                                                <div className="small mt-1">

                                                                                                    {
                                                                                                        lab.report_id
                                                                                                    }

                                                                                                </div>

                                                                                            </div>

                                                                                        ) : (

                                                                                            <span className="text-muted">

                                                                                                Not generated

                                                                                            </span>

                                                                                        )}

                                                                                    </td>

                                                                                </tr>

                                                                            )
                                                                        )}

                                                                    </tbody>

                                                                </table>

                                                            </div>


                                                            {/* DETAILED LAB RESULTS */}

                                                            {consultation.lab_tests.map(
                                                                (
                                                                    lab,
                                                                    labIndex
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            `lab-detail-${labIndex}`
                                                                        }
                                                                        className="card bg-light border mt-3"
                                                                    >

                                                                        <div className="card-body">


                                                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

                                                                                <h6 className="fw-bold mb-0">

                                                                                    <i className="bi bi-clipboard2-pulse me-2"></i>

                                                                                    {
                                                                                        lab.test_name
                                                                                    }

                                                                                </h6>


                                                                                <span
                                                                                    className={`badge ${getStatusClass(
                                                                                        lab.status
                                                                                    )}`}
                                                                                >

                                                                                    {
                                                                                        formatStatus(
                                                                                            lab.status
                                                                                        )
                                                                                    }

                                                                                </span>

                                                                            </div>


                                                                            {/* REQUEST */}

                                                                            {lab.request_id && (

                                                                                <div className="row g-3 mb-3">

                                                                                    <div className="col-md-4">

                                                                                        <span className="text-muted small">
                                                                                            Lab Request ID
                                                                                        </span>

                                                                                        <div className="fw-semibold">
                                                                                            {
                                                                                                lab.request_id
                                                                                            }
                                                                                        </div>

                                                                                    </div>


                                                                                    <div className="col-md-4">

                                                                                        <span className="text-muted small">
                                                                                            Test Code
                                                                                        </span>

                                                                                        <div className="fw-semibold">
                                                                                            {
                                                                                                lab.test_code
                                                                                            }
                                                                                        </div>

                                                                                    </div>


                                                                                    <div className="col-md-4">

                                                                                        <span className="text-muted small">
                                                                                            Price
                                                                                        </span>

                                                                                        <div className="fw-semibold">
                                                                                            ₹
                                                                                            {
                                                                                                lab.price
                                                                                            }
                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            )}


                                                                            {/* RESULT */}

                                                                            <div className="mb-3">

                                                                                <span className="text-muted small">
                                                                                    Laboratory Result
                                                                                </span>


                                                                                <div className="border rounded p-3 bg-white mt-1">

                                                                                    {lab.result ? (

                                                                                        <div
                                                                                            style={{
                                                                                                whiteSpace:
                                                                                                    "pre-wrap"
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                lab.result
                                                                                            }
                                                                                        </div>

                                                                                    ) : (

                                                                                        <span className="text-muted">

                                                                                            Laboratory result has not been entered yet.

                                                                                        </span>

                                                                                    )}

                                                                                </div>

                                                                            </div>


                                                                            {/* REMARKS */}

                                                                            <div className="mb-3">

                                                                                <span className="text-muted small">
                                                                                    Remarks
                                                                                </span>


                                                                                <div className="border rounded p-3 bg-white mt-1">

                                                                                    {lab.remarks ? (

                                                                                        <div
                                                                                            style={{
                                                                                                whiteSpace:
                                                                                                    "pre-wrap"
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                lab.remarks
                                                                                            }
                                                                                        </div>

                                                                                    ) : (

                                                                                        <span className="text-muted">

                                                                                            No remarks provided.

                                                                                        </span>

                                                                                    )}

                                                                                </div>

                                                                            </div>


                                                                            {/* TECHNICIAN */}

                                                                            {lab.technician_name && (

                                                                                <div className="mb-3">

                                                                                    <span className="text-muted small">
                                                                                        Result Entered By
                                                                                    </span>

                                                                                    <div className="fw-semibold">

                                                                                        {
                                                                                            lab.technician_name
                                                                                        }

                                                                                        {lab.technician_id && (

                                                                                            <span className="text-muted ms-2">

                                                                                                (
                                                                                                {
                                                                                                    lab.technician_id
                                                                                                }
                                                                                                )

                                                                                            </span>

                                                                                        )}

                                                                                    </div>

                                                                                </div>

                                                                            )}


                                                                            {/* COMPLETED */}

                                                                            {lab.completed_at && (

                                                                                <div className="mb-3">

                                                                                    <span className="text-muted small">
                                                                                        Completed At
                                                                                    </span>

                                                                                    <div className="fw-semibold">

                                                                                        {
                                                                                            formatDateTime(
                                                                                                lab.completed_at
                                                                                            )
                                                                                        }

                                                                                    </div>

                                                                                </div>

                                                                            )}


                                                                            {/* REPORT */}

                                                                            <div>

                                                                                <span className="text-muted small">
                                                                                    Laboratory Report
                                                                                </span>


                                                                                {lab.report_id ? (

                                                                                    <div className="mt-1">

                                                                                        <span className="badge bg-success">

                                                                                            <i className="bi bi-file-earmark-check me-1"></i>

                                                                                            Report Available

                                                                                        </span>


                                                                                        <span className="ms-2 fw-semibold">

                                                                                            {
                                                                                                lab.report_id
                                                                                            }

                                                                                        </span>

                                                                                    </div>

                                                                                ) : (

                                                                                    <div className="text-muted mt-1">

                                                                                        <i className="bi bi-hourglass-split me-1"></i>

                                                                                        Laboratory report has not been generated yet.

                                                                                    </div>

                                                                                )}

                                                                            </div>


                                                                        </div>

                                                                    </div>

                                                                )
                                                            )}

                                                        </div>

                                                    )}


                                                {/* NO LAB TESTS */}

                                                {(!consultation.lab_tests ||
                                                    consultation.lab_tests.length ===
                                                    0) && (

                                                        <div className="mb-3">

                                                            <h6 className="fw-bold">

                                                                <i className="bi bi-clipboard2-pulse me-2"></i>

                                                                Lab Tests

                                                            </h6>

                                                            <div className="text-muted">

                                                                No lab tests prescribed.

                                                            </div>

                                                        </div>

                                                    )}


                                                {/* VIEW DETAILS BUTTON */}

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() =>
                                                        setSelectedConsultation(
                                                            selectedConsultation ===
                                                            consultation.consultation_id
                                                                ? null
                                                                : consultation.consultation_id
                                                        )
                                                    }
                                                >

                                                    <i
                                                        className={
                                                            selectedConsultation ===
                                                            consultation.consultation_id
                                                                ? "bi bi-eye-slash me-2"
                                                                : "bi bi-eye me-2"
                                                        }
                                                    ></i>


                                                    {selectedConsultation ===
                                                    consultation.consultation_id
                                                        ? "Hide Details"
                                                        : "View Details"}

                                                </button>


                                                {/* READ-ONLY NOTICE */}

                                                {selectedConsultation ===
                                                    consultation.consultation_id && (

                                                        <div className="alert alert-secondary mt-3 mb-0">

                                                            <i className="bi bi-lock me-2"></i>

                                                            This consultation is
                                                            read-only. Completed
                                                            consultations cannot
                                                            be edited.

                                                        </div>

                                                    )}


                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}


            </div>

        </div>

    );

}


export default MedicalHistory;