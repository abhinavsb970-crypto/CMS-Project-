import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CompletedTests.css";

function CompletedTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/completed-tests/",
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

      if (!response.ok) {
        setError(data.detail || "Unable to load completed lab tests.");
        setLoading(false);
        return;
      }

      setTests(data);
    } catch (err) {
      console.error("COMPLETED TESTS ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (requestId) => {
    navigate(`/lab-technician/tests/${requestId}`);
  };

  return (
    <section className="completed-tests-page">
      {/* PAGE HEADER */}
      <div className="completed-tests-header">
        <div>
          <h2>Completed Lab Tests</h2>

          <p>View laboratory tests that have been completed</p>
        </div>

        <button
          className="completed-refresh-button"
          onClick={fetchCompletedTests}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="completed-tests-error">{error}</div>}

      {/* MAIN CARD */}
      <div className="completed-tests-card">
        <div className="completed-tests-list-header">
          <div>
            <h2>Completed Tests</h2>

            <p>Laboratory tests processed and completed by you</p>
          </div>

          {!loading && (
            <span className="completed-tests-count">
              {tests.length} {tests.length === 1 ? "Test" : "Tests"}
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="completed-tests-empty">
            Loading completed tests...
          </div>
        ) : tests.length === 0 ? (
          /* EMPTY */
          <div className="completed-tests-empty">
            No completed lab tests found.
          </div>
        ) : (
          /* TABLE */
          <div className="completed-tests-table-wrapper">
            <table className="completed-tests-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Test</th>
                  <th>Patient ID</th>
                  <th>Sample</th>
                  <th>Status</th>
                  <th>Completed</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    {/* REQUEST ID */}
                    <td className="completed-request-id">{test.request_id}</td>

                    {/* TEST */}
                    <td>
                      <div className="completed-test-name">
                        {test.test_name}
                      </div>

                      <div className="completed-test-code">
                        {test.test_code}
                      </div>
                    </td>

                    {/* PATIENT */}
                    <td>{test.patient_id}</td>

                    {/* SAMPLE */}
                    <td>{test.sample_type || "-"}</td>

                    {/* STATUS */}
                    <td>
                      <span className="completed-status">COMPLETED</span>
                    </td>

                    {/* COMPLETED DATE */}
                    <td>
                      {test.updated_at
                        ? new Date(test.updated_at).toLocaleString()
                        : "-"}
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        className="completed-view-button"
                        onClick={() => handleViewResult(test.request_id)}
                      >
                        View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default CompletedTests;
