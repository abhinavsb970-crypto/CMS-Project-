import { useEffect, useState } from "react";

function AdminDashboard() {
  const [staffCount, setStaffCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [labTestCount, setLabTestCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCounts = async () => {
    const token = localStorage.getItem("accessToken");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [
        staffResponse,
        medicineResponse,
        labTestResponse,
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/admin/staff/", {
          headers,
        }),
        fetch("http://127.0.0.1:8000/api/admin/medicines/", {
          headers,
        }),
        fetch("http://127.0.0.1:8000/api/admin/lab-tests/", {
          headers,
        }),
      ]);

      if (
        !staffResponse.ok ||
        !medicineResponse.ok ||
        !labTestResponse.ok
      ) {
        setError("Unable to load dashboard data.");
        setLoading(false);
        return;
      }

      const staffData = await staffResponse.json();
      const medicineData = await medicineResponse.json();
      const labTestData = await labTestResponse.json();

      setStaffCount(staffData.length);
      setMedicineCount(medicineData.length);
      setLabTestCount(labTestData.length);
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <section className="admin-dashboard-content">

      <h2>Overview</h2>

      {error && (
        <p className="admin-dashboard-error">
          {error}
        </p>
      )}

      <div className="admin-dashboard-cards">

        <div className="admin-dashboard-card">
          <h3>Staff</h3>
          <p>Manage clinic staff</p>
          <strong>
            {loading ? "..." : staffCount}
          </strong>
        </div>

        <div className="admin-dashboard-card">
          <h3>Medicines</h3>
          <p>Manage medicine master</p>
          <strong>
            {loading ? "..." : medicineCount}
          </strong>
        </div>

        <div className="admin-dashboard-card">
          <h3>Lab Tests</h3>
          <p>Manage lab test master</p>
          <strong>
            {loading ? "..." : labTestCount}
          </strong>
        </div>

      </div>

    </section>
  );
}

export default AdminDashboard;