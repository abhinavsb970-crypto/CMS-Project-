import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LaboratoryReportDetails.css";

function LaboratoryReportDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/reports/${reportId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load laboratory report.");
      }

      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="laboratory-report-details-page">
        <div className="laboratory-report-loading">
          Loading laboratory report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="laboratory-report-details-page">
        <div className="laboratory-report-error">{error}</div>

        <button
          className="laboratory-report-back-button"
          onClick={() => navigate("/lab-technician/reports")}
        >
          Back to Reports
        </button>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="laboratory-report-details-page">
      {/* Page actions */}
      <div className="laboratory-report-actions no-print">
        <button
          className="laboratory-report-back-button"
          onClick={() => navigate("/lab-technician/reports")}
        >
          ← Back to Reports
        </button>

        <button
          className="laboratory-report-print-button"
          onClick={handlePrint}
        >
          🖨 Print Report
        </button>
      </div>

      {/* Report */}
      <div className="laboratory-report-document">
        {/* Report Header */}
        <div className="laboratory-report-header">
          <div className="laboratory-report-clinic">
            <h1>CLINIC MANAGEMENT SYSTEM</h1>
            <p>Laboratory Department</p>
          </div>

          <div className="laboratory-report-title">
            <h2>LABORATORY REPORT</h2>
            <p>
              Report ID: <strong>{report.report_id}</strong>
            </p>
          </div>
        </div>

        <div className="laboratory-report-divider"></div>

        {/* Patient Information */}
        <section className="laboratory-report-section">
          <h3>Patient Information</h3>

          <div className="laboratory-report-grid">
            <div className="laboratory-report-field">
              <span>Patient ID</span>
              <strong>{report.patient_id || "-"}</strong>
            </div>

            <div className="laboratory-report-field">
              <span>Request ID</span>
              <strong>{report.request_id || "-"}</strong>
            </div>
          </div>
        </section>

        {/* Test Information */}
        <section className="laboratory-report-section">
          <h3>Laboratory Test Information</h3>

          <div className="laboratory-report-grid">
            <div className="laboratory-report-field">
              <span>Test Code</span>
              <strong>{report.test_code || "-"}</strong>
            </div>

            <div className="laboratory-report-field">
              <span>Test Name</span>
              <strong>{report.test_name || "-"}</strong>
            </div>

            <div className="laboratory-report-field">
              <span>Sample Type</span>
              <strong>{report.sample_type || "-"}</strong>
            </div>

            <div className="laboratory-report-field">
              <span>Generated Date</span>
              <strong>
                {report.generated_at
                  ? new Date(report.generated_at).toLocaleString()
                  : "-"}
              </strong>
            </div>
          </div>
        </section>

        {/* Result */}
        <section className="laboratory-report-section">
          <h3>Laboratory Result</h3>

          <div className="laboratory-report-result-box">
            {report.lab_result || "-"}
          </div>
        </section>

        {/* Remarks */}
        <section className="laboratory-report-section">
          <h3>Remarks</h3>

          <div className="laboratory-report-remarks-box">
            {report.remarks || "No remarks provided."}
          </div>
        </section>

        {/* Technician Information */}
        <section className="laboratory-report-section">
          <h3>Report Generated By</h3>

          <div className="laboratory-report-grid">
            <div className="laboratory-report-field">
              <span>Technician ID</span>
              <strong>{report.technician_id || "-"}</strong>
            </div>

            <div className="laboratory-report-field">
              <span>Technician Name</span>
              <strong>{report.technician_name || "-"}</strong>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="laboratory-report-footer">
          <p>
            This laboratory report was generated through the Clinic Management
            System.
          </p>

          <p>Report ID: {report.report_id}</p>
        </div>
      </div>
    </div>
  );
}

export default LaboratoryReportDetails;
