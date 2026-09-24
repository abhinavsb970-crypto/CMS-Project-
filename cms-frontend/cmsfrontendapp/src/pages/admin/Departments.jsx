import { useEffect, useState } from "react";
import "./Departments.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/departments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch departments");
      }

      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Department name is required.");
      setMessage("");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/departments/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            is_active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.name?.[0] ||
            data.detail ||
            "Failed to create department"
        );
      }

      setMessage("Department created successfully.");
      setName("");

      fetchDepartments();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDepartment = async (department) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/departments/${department.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !department.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update department"
        );
      }

      setMessage(
        `Department ${
          department.is_active ? "deactivated" : "activated"
        } successfully.`
      );

      fetchDepartments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="departments-page">

      <div className="departments-header">
        <h1>Department Management</h1>
        <p>Manage clinic departments and their active status.</p>
      </div>

      {/* Add Department */}
      <div className="departments-card">
        <form
          className="department-form"
          onSubmit={handleSubmit}
        >
          <div className="department-form-group">
            <label htmlFor="department-name">
              Department Name
            </label>

            <input
              id="department-name"
              type="text"
              placeholder="e.g. Cardiology"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="department-add-button"
          >
            Add Department
          </button>
        </form>

        {message && (
          <p className="department-message department-success">
            {message}
          </p>
        )}

        {error && (
          <p className="department-message department-error">
            {error}
          </p>
        )}
      </div>

      {/* Department List */}
      <div className="departments-list-card">

        <div className="departments-list-header">
          <h2>Departments</h2>
          <p>
            View and manage all clinic departments.
          </p>
        </div>

        {loading ? (
          <div className="department-empty">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="department-empty">
            No departments found.
          </div>
        ) : (
          <div className="departments-table-wrapper">
            <table className="departments-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>

                    <td className="department-id">
                      #{department.id}
                    </td>

                    <td className="department-name">
                      {department.name}
                    </td>

                    <td>
                      <span
                        className={`department-status ${
                          department.is_active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {department.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`department-action-button ${
                          department.is_active
                            ? "deactivate"
                            : "activate"
                        }`}
                        onClick={() =>
                          toggleDepartment(department)
                        }
                      >
                        {department.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default Departments;