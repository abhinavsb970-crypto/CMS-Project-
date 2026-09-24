
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PendingTests.css";

function PendingTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/pending-tests/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setError("Unable to load pending lab tests.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTests(data);
    } catch (err) {
      console.error("PENDING TESTS ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  const handleViewTest = (requestId) => {
    navigate(`/lab-technician/tests/${requestId}`);
  };

  return (
    <section className="pending-tests-page">

      {/* Page Header */}
      <div className="pending-tests-header">
        <h2>Pending Lab Tests</h2>
        <p>
          View and process laboratory tests assigned to you
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="pending-tests-error">
          {error}
        </p>
      )}

      {/* Tests Card */}
      <div className="pending-tests-card">

        <div className="pending-tests-list-header">
          <div>
            <h2>Assigned Tests</h2>
            <p>
              Tests that are currently waiting for processing
            </p>
          </div>

          <button
            className="pending-refresh-button"
            onClick={fetchPendingTests}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="pending-tests-empty">
            Loading tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="pending-tests-empty">
            No pending lab tests found.
          </div>
        ) : (
          <div className="pending-tests-table-wrapper">

            <table className="pending-tests-table">

              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Test</th>
                  <th>Patient ID</th>
                  <th>Sample</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>

                    <td className="pending-request-id">
                      {test.request_id}
                    </td>

                    <td>
                      <div className="pending-test-name">
                        {test.test_name}
                      </div>

                      <div className="pending-test-code">
                        {test.test_code}
                      </div>
                    </td>

                    <td>
                      {test.patient_id}
                    </td>

                    <td>
                      {test.sample_type || "-"}
                    </td>

                    <td>
                      <span
                        className={`pending-status ${test.status
                          .toLowerCase()
                          .replace("_", "-")}`}
                      >
                        {test.status.replace("_", " ")}
                      </span>
                    </td>

                    <td>
                      <button
                        className="pending-view-button"
                        onClick={() =>
                          handleViewTest(test.request_id)
                        }
                      >
                        View
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

export default PendingTests;
