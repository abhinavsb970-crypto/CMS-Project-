import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CompletedTestResult.css";

function CompletedTestResult() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompletedTest();
  }, [requestId]);

  const fetchCompletedTest = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
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
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load lab test result.");
        setLoading(false);
        return;
      }

      setTest(data);
    } catch (err) {
      console.error("COMPLETED RESULT ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate("/lab-technician/completed-tests");
  };

  if (loading) {
    return (
      <section className="completed-result-page">
        <div className="completed-result-loading">
          Loading laboratory result...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="completed-result-page">
        <div className="completed-result-error">{error}</div>

        <button className="completed-result-back-button" onClick={handleBack}>
          Back to Completed Tests
        </button>
      </section>
    );
  }

  if (!test) {
    return (
      <section className="completed-result-page">
        <div className="completed-result-error">Laboratory test not found.</div>

        <button className="completed-result-back-button" onClick={handleBack}>
          Back to Completed Tests
        </button>
      </section>
    );
  }

  return (
    <section className="completed-result-page">
      {/* =========================================
          Page Header
          ========================================= */}

      <div className="completed-result-header">
        <div>
          <h2>Laboratory Test Result</h2>

          <p>Completed laboratory test report</p>
        </div>

        <button className="completed-result-back-button" onClick={handleBack}>
          Back to Completed Tests
        </button>
      </div>

      {/* =========================================
          Test Information
          ========================================= */}

      <div className="completed-result-card">
        <div className="completed-result-card-header">
          <div>
            <h2>Test Information</h2>

            <p>Information related to this laboratory request</p>
          </div>

          <span className="completed-result-status">COMPLETED</span>
        </div>

        <div className="completed-result-grid">
          <div className="completed-result-item">
            <span>Request ID</span>

            <strong className="request-id">{test.request_id}</strong>
          </div>

          <div className="completed-result-item">
            <span>Patient ID</span>

            <strong>{test.patient_id}</strong>
          </div>

          <div className="completed-result-item">
            <span>Doctor ID</span>

            <strong>{test.doctor_id || "-"}</strong>
          </div>

          <div className="completed-result-item">
            <span>Test Code</span>

            <strong>{test.test_code}</strong>
          </div>

          <div className="completed-result-item">
            <span>Test Name</span>

            <strong>{test.test_name}</strong>
          </div>

          <div className="completed-result-item">
            <span>Category</span>

            <strong>{test.category || "-"}</strong>
          </div>

          <div className="completed-result-item">
            <span>Sample Type</span>

            <strong>{test.sample_type || "-"}</strong>
          </div>

          <div className="completed-result-item">
            <span>Assigned Technician</span>

            <strong>{test.technician_name || "-"}</strong>
          </div>
        </div>
      </div>

      {/* =========================================
          Laboratory Result
          ========================================= */}

      <div className="completed-result-report-card">
        <div className="completed-result-report-header">
          <div>
            <h2>Laboratory Result</h2>

            <p>Final result recorded for this test</p>
          </div>
        </div>

        <div className="completed-result-report-body">
          <div className="result-section">
            <span className="result-label">RESULT</span>

            <div className="result-value">
              {test.lab_result || "No result recorded."}
            </div>
          </div>

          <div className="result-section">
            <span className="result-label">REMARKS</span>

            <div className="remarks-value">
              {test.result_remarks || "No remarks provided."}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          Technician Information
          ========================================= */}

      <div className="completed-result-card">
        <div className="completed-result-card-header">
          <div>
            <h2>Report Information</h2>

            <p>Information about the technician who entered the result</p>
          </div>
        </div>

        <div className="completed-result-grid">
          <div className="completed-result-item">
            <span>Technician ID</span>

            <strong>{test.result_technician_id || "-"}</strong>
          </div>

          <div className="completed-result-item">
            <span>Technician Name</span>

            <strong>{test.result_technician_name || "-"}</strong>
          </div>

          <div className="completed-result-item">
            <span>Requested At</span>

            <strong>
              {test.requested_at
                ? new Date(test.requested_at).toLocaleString()
                : "-"}
            </strong>
          </div>

          <div className="completed-result-item">
            <span>Completed At</span>

            <strong>
              {test.completed_at
                ? new Date(test.completed_at).toLocaleString()
                : "-"}
            </strong>
          </div>
        </div>
      </div>

      {/* =========================================
          Bottom Button
          ========================================= */}

      <div className="completed-result-actions">
        <button
          className="completed-result-back-main-button"
          onClick={handleBack}
        >
          Back to Completed Tests
        </button>
      </div>
    </section>
  );
}

export default CompletedTestResult;
