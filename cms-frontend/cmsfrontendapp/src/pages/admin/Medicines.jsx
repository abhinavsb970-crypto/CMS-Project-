
import { useEffect, useState } from "react";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    brand_name: "",
    formulation: "",
    strength: "",
    unit: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000/api/admin/medicines/";

  // Get the correct JWT access token
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch medicines."
        );
      }

      setMedicines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      generic_name: "",
      brand_name: "",
      formulation: "",
      strength: "",
      unit: "",
    });
  };

  // Add medicine
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name.trim()) {
      setError("Medicine name is required.");
      return;
    }

    if (!formData.formulation.trim()) {
      setError("Formulation is required.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          generic_name: formData.generic_name.trim(),
          brand_name: formData.brand_name.trim(),
          formulation: formData.formulation.trim(),
          strength: formData.strength.trim(),
          unit: formData.unit.trim(),
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.name?.[0] ||
            data.detail ||
            "Failed to create medicine."
        );
      }

      setMessage("Medicine added successfully.");

      resetForm();

      await fetchMedicines();
    } catch (err) {
      setError(err.message);
    }
  };

  // Activate / deactivate medicine
  const toggleMedicine = async (medicine) => {
    setMessage("");
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${API_URL}${medicine.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !medicine.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update medicine."
        );
      }

      setMessage(
        `Medicine ${
          medicine.is_active ? "deactivated" : "activated"
        } successfully.`
      );

      await fetchMedicines();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">
          Medicine Master
        </h1>

        <p className="text-muted mb-0">
          Manage medicines, formulations, strengths and active status.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Add Medicine Card */}
      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white py-3">
          <h5 className="mb-1 fw-semibold">
            Add Medicine
          </h5>

          <small className="text-muted">
            Enter the medicine details below.
          </small>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              {/* Medicine Name */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Medicine Name <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="e.g. Paracetamol"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Generic Name */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Generic Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="generic_name"
                  placeholder="e.g. Paracetamol"
                  value={formData.generic_name}
                  onChange={handleChange}
                />
              </div>

              {/* Brand Name */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Brand Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="brand_name"
                  placeholder="e.g. Crocin"
                  value={formData.brand_name}
                  onChange={handleChange}
                />
              </div>

              {/* Formulation */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Formulation <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  name="formulation"
                  value={formData.formulation}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select formulation
                  </option>

                  <option value="Tablet">
                    Tablet
                  </option>

                  <option value="Capsule">
                    Capsule
                  </option>

                  <option value="Syrup">
                    Syrup
                  </option>

                  <option value="Injection">
                    Injection
                  </option>

                  <option value="Cream">
                    Cream
                  </option>

                  <option value="Ointment">
                    Ointment
                  </option>

                  <option value="Drops">
                    Drops
                  </option>

                  <option value="Inhaler">
                    Inhaler
                  </option>

                  <option value="Suspension">
                    Suspension
                  </option>
                </select>
              </div>

              {/* Strength */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Strength
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="strength"
                  placeholder="e.g. 500"
                  value={formData.strength}
                  onChange={handleChange}
                />
              </div>

              {/* Unit */}
              <div className="col-md-6 col-lg-4">
                <label className="form-label fw-semibold">
                  Unit
                </label>

                <select
                  className="form-select"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="">
                    Select unit
                  </option>

                  <option value="mg">
                    mg
                  </option>

                  <option value="g">
                    g
                  </option>

                  <option value="mcg">
                    mcg
                  </option>

                  <option value="ml">
                    ml
                  </option>

                  <option value="%">
                    %
                  </option>
                </select>
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-4 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Medicine
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={resetForm}
              >
                Clear
              </button>

            </div>

          </form>

        </div>
      </div>

      {/* Medicine List */}
      <div className="card shadow-sm">

        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">

          <div>
            <h5 className="mb-1 fw-semibold">
              Medicine List
            </h5>

            <small className="text-muted">
              All medicines registered in the Medicine Master.
            </small>
          </div>

          <span className="badge bg-primary rounded-pill">
            {medicines.length} Medicines
          </span>

        </div>

        <div className="card-body p-0">

          {loading ? (

            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>

              <p className="text-muted mb-0">
                Loading medicines...
              </p>
            </div>

          ) : medicines.length === 0 ? (

            <div className="text-center py-5">

              <div className="fs-1 text-muted mb-3">
                💊
              </div>

              <h5>
                No medicines found
              </h5>

              <p className="text-muted mb-0">
                Add your first medicine using the form above.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th className="px-3">ID</th>
                    <th>Medicine</th>
                    <th>Generic Name</th>
                    <th>Brand</th>
                    <th>Formulation</th>
                    <th>Strength</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th className="text-center">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {medicines.map((medicine) => (

                    <tr key={medicine.id}>

                      <td className="px-3 text-muted">
                        #{medicine.id}
                      </td>

                      <td>
                        <strong>
                          {medicine.name}
                        </strong>
                      </td>

                      <td>
                        {medicine.generic_name || "-"}
                      </td>

                      <td>
                        {medicine.brand_name || "-"}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {medicine.formulation}
                        </span>
                      </td>

                      <td>
                        {medicine.strength || "-"}
                      </td>

                      <td>
                        {medicine.unit || "-"}
                      </td>

                      <td>

                        {medicine.is_active ? (

                          <span className="badge bg-success">
                            Active
                          </span>

                        ) : (

                          <span className="badge bg-secondary">
                            Inactive
                          </span>

                        )}

                      </td>

                      <td className="text-center">

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            medicine.is_active
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            toggleMedicine(medicine)
                          }
                        >
                          {medicine.is_active
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

    </div>
  );
}

export default Medicines;

