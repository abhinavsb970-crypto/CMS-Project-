import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getConsultationHistory
} from "../../api/doctorApi";


function ConsultationHistory() {

    const navigate = useNavigate();


    const [searchType, setSearchType] =
        useState("patient_id");

    const [searchValue, setSearchValue] =
        useState("");

    const [results, setResults] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    async function handleSearch() {

        if (!searchValue.trim()) {

            setError(
                "Please enter a search value."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");

            const data =
                await getConsultationHistory(
                    searchType,
                    searchValue
                );

            setResults(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    }


    return (

        <div className="min-vh-100 bg-light">

            <div className="container py-4">


                <button
                    className="btn btn-link text-dark text-decoration-none px-0 mb-3"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <i className="bi bi-arrow-left fs-5 me-2"></i>

                    Back

                </button>


                <div className="card border-0 shadow-sm">

                    <div className="card-header bg-primary text-white py-3">

                        <h3 className="text-center mb-0 fw-bold">

                            <i className="bi bi-clock-history me-2"></i>

                            CONSULTATION HISTORY

                        </h3>

                    </div>


                    <div className="card-body">


                        <div className="row g-3 mb-4">


                            <div className="col-md-4">

                                <label className="form-label fw-semibold">

                                    Search By

                                </label>

                                <select
                                    className="form-select"
                                    value={searchType}
                                    onChange={(e) =>
                                        setSearchType(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="patient_id">
                                        Patient ID
                                    </option>

                                    <option value="patient_name">
                                        Patient Name
                                    </option>

                                </select>

                            </div>


                            <div className="col-md-5">

                                <label className="form-label fw-semibold">

                                    Search Value

                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={
                                        searchType ===
                                        "patient_id"
                                            ? "Enter Patient ID"
                                            : "Enter Patient Name"
                                    }
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {

                                        if (
                                            e.key ===
                                            "Enter"
                                        ) {

                                            handleSearch();

                                        }

                                    }}
                                />

                            </div>


                            <div className="col-md-3 d-flex align-items-end">

                                <button
                                    className="btn btn-primary w-100"
                                    onClick={
                                        handleSearch
                                    }
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Searching..."
                                        : "Search"}

                                </button>

                            </div>

                        </div>


                        {error && (

                            <div className="alert alert-danger">
                                {error}
                            </div>

                        )}


                        {!loading &&
                            results.length === 0 &&
                            !error && (

                                <div className="alert alert-info">

                                    Search for a patient to view consultation history.

                                </div>

                            )}


                        {results.length > 0 && (

                            <div className="table-responsive">

                                <table className="table table-bordered table-hover align-middle">

                                    <thead className="table-light">

                                        <tr>

                                            <th>Consultation ID</th>

                                            <th>Patient ID</th>

                                            <th>Patient Name</th>

                                            <th>Date</th>

                                            <th>Diagnosis</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {results.map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.consultation_id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            item.consultation_id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.patient_id
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.patient_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            item.consultation_date
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.diagnosis
                                                        }
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


export default ConsultationHistory;