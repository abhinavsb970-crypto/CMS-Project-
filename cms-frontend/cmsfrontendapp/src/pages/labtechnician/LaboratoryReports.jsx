import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LaboratoryReports.css";

function LaboratoryReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("report_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/reports/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load laboratory reports."
        );
      }

      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    if (searchBy === "report_id") {
      return report.report_id?.toLowerCase().includes(value);
    }

    if (searchBy === "patient_id") {
      return String(report.patient_id || "")
        .toLowerCase()
        .includes(value);
    }

    if (searchBy === "test_name") {
      return report.test_name?.toLowerCase().includes(value);
    }

    return true;
  });

  const handleViewReport = (report) => {
    navigate(`/lab-technician/reports/${report.report_id}`);
  };

  return (
    <div className="laboratory-reports-page">

      <div className="laboratory-reports-header">
        <div>
          <h2>Laboratory Reports</h2>
          <p>
            View and manage generated laboratory reports
          </p>
        </div>

        <button
          className="laboratory-reports-refresh-button"
          onClick={fetchReports}
        >
          Refresh
        </button>
      </div>

      <div className="laboratory-reports-search-card">

        <div className="laboratory-reports-search-group">
          <label>Search By</label>

          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option value="report_id">Report ID</option>
            <option value="patient_id">Patient ID</option>
            <option value="test_name">Test Name</option>
          </select>
        </div>

        <div className="laboratory-reports-search-group search-input-group">
          <label>Search</label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter search value..."
          />
        </div>

        <button
          className="laboratory-reports-clear-button"
          onClick={() => setSearch("")}
        >
          Clear
        </button>

      </div>

      {loading && (
        <div className="laboratory-reports-loading">
          Loading laboratory reports...
        </div>
      )}

      {error && (
        <div className="laboratory-reports-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="laboratory-reports-card">

          <div className="laboratory-reports-card-header">
            <div>
              <h3>Generated Reports</h3>
              <p>
                {filteredReports.length}{" "}
                {filteredReports.length === 1
                  ? "Report"
                  : "Reports"}
              </p>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="laboratory-reports-empty">
              <h3>No Laboratory Reports Found</h3>
              <p>
                No generated laboratory reports match your search.
              </p>
            </div>
          ) : (
            <div className="laboratory-reports-table-wrapper">

              <table className="laboratory-reports-table">

                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Request ID</th>
                    <th>Patient ID</th>
                    <th>Test Code</th>
                    <th>Test Name</th>
                    <th>Result</th>
                    <th>Generated At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id}>

                      <td className="report-id">
                        {report.report_id}
                      </td>

                      <td>
                        {report.request_id}
                      </td>

                      <td>
                        {report.patient_id}
                      </td>

                      <td>
                        {report.test_code}
                      </td>

                      <td>
                        {report.test_name}
                      </td>

                      <td>
                        <span className="result-preview">
                          {report.lab_result || "-"}
                        </span>
                      </td>

                      <td>
                        {report.generated_at
                          ? new Date(
                              report.generated_at
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="laboratory-reports-view-button"
                          onClick={() =>
                            handleViewReport(report)
                          }
                        >
                          View Report
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default LaboratoryReports;