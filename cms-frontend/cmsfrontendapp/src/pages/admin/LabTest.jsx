import { useEffect, useState } from "react";

function LabTests() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    test_code: "",
    test_name: "",
    category: "",
    sample_type: "",
    price: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:8000/api/admin/lab-tests/";

  // Get JWT access token
  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch all lab tests
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
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
          data.detail || "Failed to fetch lab tests."
        );
      }

      setLabTests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      test_code: "",
      test_name: "",
      category: "",
      sample_type: "",
      price: "",
    });
  };

  // Add lab test
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.test_code.trim()) {
      setError("Test code is required.");
      return;
    }

    if (!formData.test_name.trim()) {
      setError("Test name is required.");
      return;
    }

    if (!formData.price) {
      setError("Price is required.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_code: formData.test_code.trim().toUpperCase(),
          test_name: formData.test_name.trim(),
          category: formData.category.trim(),
          sample_type: formData.sample_type.trim(),
          price: formData.price,
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.test_code?.[0] ||
            data.test_name?.[0] ||
            data.price?.[0] ||
            data.detail ||
            "Failed to create lab test."
        );
      }

      setMessage("Lab test added successfully.");

      resetForm();

      await fetchLabTests();
    } catch (err) {
      setError(err.message);
    }
  };

  // Activate / deactivate lab test
  const toggleLabTest = async (labTest) => {
    setMessage("");
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}${labTest.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !labTest.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update lab test."
        );
      }

      setMessage(
        `Lab test ${
          labTest.is_active ? "deactivated" : "activated"
        } successfully.`
      );

      await fetchLabTests();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Page Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">
          Lab Test Master
        </h1>

        <p className="text-muted mb-0">
          Manage laboratory tests, categories, sample types,
          prices and active status.
        </p>
      </div>

      {/* Success Message */}
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

      {/* Error Message */}
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

      {/* Add Lab Test */}
      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white py-3">

          <h5 className="mb-1 fw-semibold">
            Add Lab Test
          </h5>

          <small className="text-muted">
            Enter the laboratory test details below.
          </small>

        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row g-3">

              {/* Test Code */}
              <div className="col-md-6 col-lg-4">

                <label className="form-label fw-semibold">
                  Test Code{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="test_code"
                  placeholder="e.g. CBC001"
                  value={formData.test_code}
                  onChange={handleChange}
                  required
                />

                <div className="form-text">
                  Must be unique.
                </div>

              </div>

              {/* Test Name */}
              <div className="col-md-6 col-lg-4">

                <label className="form-label fw-semibold">
                  Test Name{" "}
                  <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="test_name"
                  placeholder="e.g. Complete Blood Count"
                  value={formData.test_name}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Category */}
              <div className="col-md-6 col-lg-4">

                <label className="form-label fw-semibold">
                  Category
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="category"
                  placeholder="e.g. Hematology"
                  value={formData.category}
                  onChange={handleChange}
                />

              </div>

              {/* Sample Type */}
              <div className="col-md-6 col-lg-4">

                <label className="form-label fw-semibold">
                  Sample Type
                </label>

                <select
                  className="form-select"
                  name="sample_type"
                  value={formData.sample_type}
                  onChange={handleChange}
                >

                  <option value="">
                    Select sample type
                  </option>

                  <option value="Blood">
                    Blood
                  </option>

                  <option value="Urine">
                    Urine
                  </option>

                  <option value="Stool">
                    Stool
                  </option>

                  <option value="Sputum">
                    Sputum
                  </option>

                  <option value="Saliva">
                    Saliva
                  </option>

                  <option value="Swab">
                    Swab
                  </option>

                  <option value="Serum">
                    Serum
                  </option>

                  <option value="Plasma">
                    Plasma
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Price */}
              <div className="col-md-6 col-lg-4">

                <label className="form-label fw-semibold">
                  Price{" "}
                  <span className="text-danger">*</span>
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    ₹
                  </span>

                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    placeholder="e.g. 350"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>

            {/* Buttons */}
            <div className="mt-4 d-flex gap-2">

              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Lab Test
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

      {/* Lab Test List */}
      <div className="card shadow-sm">

        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">

          <div>

            <h5 className="mb-1 fw-semibold">
              Lab Test List
            </h5>

            <small className="text-muted">
              All laboratory tests registered in the Lab Master.
            </small>

          </div>

          <span className="badge bg-primary rounded-pill">
            {labTests.length} Tests
          </span>

        </div>

        <div className="card-body p-0">

          {/* Loading */}
          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>

              <p className="text-muted mb-0">
                Loading lab tests...
              </p>

            </div>

          ) : labTests.length === 0 ? (

            /* Empty State */
            <div className="text-center py-5">

              <div className="fs-1 text-muted mb-3">
                🧪
              </div>

              <h5>
                No lab tests found
              </h5>

              <p className="text-muted mb-0">
                Add your first lab test using the form above.
              </p>

            </div>

          ) : (

            /* Table */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
                      ID
                    </th>

                    <th>
                      Test Code
                    </th>

                    <th>
                      Test Name
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Sample Type
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {labTests.map((labTest) => (

                    <tr key={labTest.id}>

                      <td className="px-3 text-muted">
                        #{labTest.id}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {labTest.test_code}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {labTest.test_name}
                        </strong>
                      </td>

                      <td>
                        {labTest.category || "-"}
                      </td>

                      <td>
                        {labTest.sample_type || "-"}
                      </td>

                      <td>
                        <strong>
                          ₹{Number(labTest.price).toFixed(2)}
                        </strong>
                      </td>

                      <td>

                        {labTest.is_active ? (

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
                            labTest.is_active
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            toggleLabTest(labTest)
                          }
                        >
                          {labTest.is_active
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

export default LabTests;

