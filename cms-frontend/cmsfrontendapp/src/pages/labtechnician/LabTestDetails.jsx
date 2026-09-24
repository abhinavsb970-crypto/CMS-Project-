import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import "./LabTestDetails.css";

function LabTestDetails() {
  const { requestId } = useParams();

  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  const [loading, setLoading] = useState(true);

  const [generatingReport, setGeneratingReport] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // FETCH TEST DETAILS
  // ==========================================================

  useEffect(() => {
    fetchTestDetails();
  }, [requestId]);

  const fetchTestDetails = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        setError("Laboratory test record not found.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.detail || "Unable to load laboratory test details.");
        setLoading(false);
        return;
      }

      setTest(data);
    } catch (err) {
      console.error("LAB TEST DETAILS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ENTER RESULT
  // ==========================================================

  const handleEnterResult = () => {
    navigate(`/lab-technician/tests/${requestId}/result`);
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    if (test && test.status === "COMPLETED") {
      navigate("/lab-technician/completed-tests");
    } else {
      navigate("/lab-technician/pending-tests");
    }
  };

  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================================
  // GENERATE REPORT
  // ==========================================================

  const handleGenerateReport = async () => {
    if (!test || test.status !== "COMPLETED") {
      return;
    }

    setGeneratingReport(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setGeneratingReport(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/report/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      // ------------------------------------------------------
      // TOKEN EXPIRED
      // ------------------------------------------------------

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setGeneratingReport(false);
        return;
      }

      // ------------------------------------------------------
      // API ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        setError(data.detail || "Unable to generate laboratory report.");
        setGeneratingReport(false);
        return;
      }

      // ------------------------------------------------------
      // BILL MUST BE CREATED BY BACKEND
      // ------------------------------------------------------

      if (!data.bill || !data.bill.bill_id) {
        setError(
          "Laboratory report was generated, but the laboratory bill was not created.",
        );
        setGeneratingReport(false);
        return;
      }

      // ------------------------------------------------------
      // REPORT + BILL CREATED
      // ------------------------------------------------------

      /*
        Backend response:

        {
          detail: "...",
          report: {...},
          bill: {
            bill_id: "BILL00002",
            ...
          }
        }

        We now send the technician directly
        to the payment page.
      */

      navigate(`/lab-technician/payment/${data.bill.bill_id}`);
    } catch (err) {
      console.error("GENERATE LABORATORY REPORT ERROR:", err);

      setError("Unable to connect to the server.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="lab-test-details-page">
        <div className="lab-test-details-loading">
          Loading lab test details...
        </div>
      </section>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !test) {
    return (
      <section className="lab-test-details-page">
        <div className="lab-test-details-error">{error}</div>

        <button
          className="lab-test-back-button"
          onClick={() => navigate("/lab-technician/completed-tests")}
        >
          Back to Completed Tests
        </button>
      </section>
    );
  }

  if (!test) {
    return (
      <section className="lab-test-details-page">
        <div className="lab-test-details-error">Lab test not found.</div>

        <button
          className="lab-test-back-button"
          onClick={() => navigate("/lab-technician/completed-tests")}
        >
          Back to Completed Tests
        </button>
      </section>
    );
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  const statusClass = test.status
    ? test.status.toLowerCase().replace(/_/g, "-")
    : "";

  const statusText = test.status ? test.status.replace(/_/g, " ") : "-";

  const isCompleted = test.status === "COMPLETED";

  const isCancelled = test.status === "CANCELLED";

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <section className="lab-test-details-page">
      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="lab-test-details-header">
        <div>
          <h2>Lab Test Details</h2>

          <p>View laboratory test request and result information</p>
        </div>

        <div className="lab-test-header-actions no-print">
          <button className="lab-test-back-button" onClick={handleBack}>
            ← Back
          </button>

          {isCompleted && (
            <button className="lab-test-print-button" onClick={handlePrint}>
              🖨 Print
            </button>
          )}
        </div>
      </div>

      {/* ====================================================
          ERROR MESSAGE
          ==================================================== */}

      {error && <div className="lab-test-details-error no-print">{error}</div>}

      {/* ====================================================
          TEST REQUEST
          ==================================================== */}

      <div className="lab-test-details-card">
        <div className="lab-test-details-card-header">
          <div>
            <h2>Test Request</h2>

            <p>Request information and processing status</p>
          </div>

          <span className={`lab-test-status ${statusClass}`}>{statusText}</span>
        </div>

        <div className="lab-test-details-grid">
          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Request ID</span>

            <span className="lab-test-detail-value request-id">
              {test.request_id || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Patient ID</span>

            <span className="lab-test-detail-value">
              {test.patient_id || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Doctor ID</span>

            <span className="lab-test-detail-value">
              {test.doctor_id || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Test Code</span>

            <span className="lab-test-detail-value">
              {test.test_code || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Test Name</span>

            <span className="lab-test-detail-value">
              {test.test_name || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Department</span>

            <span className="lab-test-detail-value">
              {test.department_name || test.department || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Category</span>

            <span className="lab-test-detail-value">
              {test.category || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Sample Type</span>

            <span className="lab-test-detail-value">
              {test.sample_type || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Assigned Technician</span>

            <span className="lab-test-detail-value">
              {test.technician_name || "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Requested At</span>

            <span className="lab-test-detail-value">
              {test.requested_at
                ? new Date(test.requested_at).toLocaleString()
                : "-"}
            </span>
          </div>

          <div className="lab-test-detail-item">
            <span className="lab-test-detail-label">Last Updated</span>

            <span className="lab-test-detail-value">
              {test.updated_at
                ? new Date(test.updated_at).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          LABORATORY RESULT
          ==================================================== */}

      {test.result && (
        <div className="lab-test-details-card">
          <div className="lab-test-details-card-header">
            <div>
              <h2>Laboratory Result</h2>

              <p>Result recorded for this laboratory test</p>
            </div>
          </div>

          <div className="lab-test-result-section">
            <div className="lab-test-result-field">
              <span className="lab-test-detail-label">Result</span>

              <div className="lab-test-result-box">{test.result}</div>
            </div>

            <div className="lab-test-result-field">
              <span className="lab-test-detail-label">Remarks</span>

              <div className="lab-test-result-box">
                {test.remarks || "No remarks provided."}
              </div>
            </div>

            {test.completed_at && (
              <div className="lab-test-detail-item">
                <span className="lab-test-detail-label">Completed At</span>

                <span className="lab-test-detail-value">
                  {new Date(test.completed_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TEST PROCESSING
          ==================================================== */}

      <div className="lab-test-actions-card no-print">
        <div>
          <h2>Test Processing</h2>

          <p>
            {isCompleted
              ? "This laboratory test has been completed and the result has been recorded."
              : "Enter the laboratory result after processing the patient's sample."}
          </p>
        </div>

        <div className="lab-test-actions">
          {/* ENTER RESULT */}

          {!isCompleted && !isCancelled && (
            <button
              className="lab-enter-result-button"
              onClick={handleEnterResult}
            >
              Enter Lab Result
            </button>
          )}

          {/* ==================================================
              GENERATE REPORT
              ================================================== */}

          {isCompleted && (
            <button
              className="lab-generate-report-button"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport
                ? "Generating Report..."
                : "Generate Report → Payment"}
            </button>
          )}

          {/* PRINT */}

          {isCompleted && (
            <button className="lab-test-print-button" onClick={handlePrint}>
              🖨 Print Result
            </button>
          )}

          {/* BACK */}

          <button className="lab-test-secondary-button" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    </section>
  );
}

export default LabTestDetails;
