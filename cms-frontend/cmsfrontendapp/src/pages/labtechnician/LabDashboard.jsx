import { useEffect, useState } from "react";
import "./LabDashboard.css";

function LabDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      // Fetch assigned active tests
      const pendingResponse = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/pending-tests/",
        {
          headers,
        },
      );

      // Fetch completed tests
      const completedResponse = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/completed-tests/",
        {
          headers,
        },
      );

      if (!pendingResponse.ok || !completedResponse.ok) {
        setError("Unable to load dashboard data.");
        setLoading(false);
        return;
      }

      const pendingData = await pendingResponse.json();
      const completedData = await completedResponse.json();

      // pending-tests/ returns both PENDING and IN_PROGRESS
      const pending = pendingData.filter((test) => test.status === "PENDING");

      const inProgress = pendingData.filter(
        (test) => test.status === "IN_PROGRESS",
      );

      setPendingCount(pending.length);
      setInProgressCount(inProgress.length);
      setCompletedCount(completedData.length);
    } catch (err) {
      console.error("LAB DASHBOARD ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  return (
    <section className="lab-dashboard-content">
      {/* Dashboard heading */}
      <div className="lab-dashboard-header">
        <h2>Overview</h2>
        <p>Laboratory test processing summary</p>
      </div>

      {/* Error message */}
      {error && <p className="lab-dashboard-error">{error}</p>}

      {/* Dashboard cards */}
      <div className="lab-dashboard-cards">
        {/* Pending Tests */}
        <div className="lab-dashboard-card">
          <h3>Pending Tests</h3>

          <p>Tests waiting for processing</p>

          <strong>{loading ? "..." : pendingCount}</strong>
        </div>

        {/* In Progress */}
        <div className="lab-dashboard-card">
          <h3>In Progress</h3>

          <p>Tests currently being processed</p>

          <strong>{loading ? "..." : inProgressCount}</strong>
        </div>

        {/* Completed Tests */}
        <div className="lab-dashboard-card">
          <h3>Completed Tests</h3>

          <p>Tests completed by you</p>

          <strong>{loading ? "..." : completedCount}</strong>
        </div>
      </div>
    </section>
  );
}

export default LabDashboard;
