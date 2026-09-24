import { useEffect, useState } from "react";

import "./TestManagement.css";

function TestManagement() {
  const [tests, setTests] = useState([]);

  const [searchBy, setSearchBy] = useState("test_id");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewingTest, setViewingTest] = useState(null);

  // =====================================================
  // FETCH TESTS
  // =====================================================

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async (
    currentSearch = search,
    currentSearchBy = searchBy,
  ) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = "http://127.0.0.1:8000/api/lab-technician/test-management/";

      if (currentSearch.trim()) {
        url += `?search=${encodeURIComponent(
          currentSearch.trim(),
        )}&search_by=${currentSearchBy}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Unable to load laboratory tests.");
        setLoading(false);
        return;
      }

      setTests(data);

      if (currentSearch.trim() && data.length === 0) {
        setError("Test Not Found.");
      }
    } catch (err) {
      console.error("TEST MANAGEMENT ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  // =====================================================
  // SEARCH VALIDATION
  // =====================================================

  const validateSearch = () => {
    const value = search.trim();

    if (!value) {
      return true;
    }

    if (searchBy === "test_id") {
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        setError("Test ID must contain letters and numbers only.");
        return false;
      }
    }

    if (searchBy === "test_name") {
      if (!/^[A-Za-z ]+$/.test(value)) {
        setError("Test Name must contain alphabetic characters only.");
        return false;
      }
    }

    return true;
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    setError("");

    if (!validateSearch()) {
      return;
    }

    fetchTests(search.trim(), searchBy);
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const handleClearSearch = () => {
    setSearch("");
    setError("");

    fetchTests("", searchBy);
  };

  // =====================================================
  // VIEW TEST
  // =====================================================

  const handleViewTest = (test) => {
    setViewingTest(test);
    setError("");
  };

  const closeViewModal = () => {
    setViewingTest(null);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="test-management-page">
      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="test-management-header">
        <div>
          <h2>Test Management</h2>
          <p>View available laboratory tests</p>
        </div>
      </div>

      {/* =================================================
          MESSAGES
          ================================================= */}

      {error && <div className="test-management-error">{error}</div>}

      {/* =================================================
          SEARCH CARD
          ================================================= */}

      <div className="test-search-card">
        <div className="test-search-header">
          <div>
            <h2>Search Laboratory Tests</h2>
            <p>Search using Test ID or Test Name</p>
          </div>
        </div>

        <form className="test-search-form" onSubmit={handleSearch}>
          <div className="test-search-field">
            <label>Search By</label>

            <select
              value={searchBy}
              onChange={(event) => {
                setSearchBy(event.target.value);
                setError("");
              }}
            >
              <option value="test_id">Test ID</option>

              <option value="test_name">Test Name</option>
            </select>
          </div>

          <div className="test-search-input-field">
            <label>{searchBy === "test_id" ? "Test ID" : "Test Name"}</label>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                searchBy === "test_id" ? "Enter Test ID" : "Enter Test Name"
              }
            />
          </div>

          <button type="submit" className="test-search-button">
            Search
          </button>

          <button
            type="button"
            className="test-clear-button"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </form>
      </div>

      {/* =================================================
          TEST LIST
          ================================================= */}

      <div className="test-list-card">
        <div className="test-list-header">
          <div>
            <h2>Laboratory Tests</h2>

            <p>Standardized tests available in the clinic</p>
          </div>

          {!loading && (
            <span className="test-count">
              {tests.length} {tests.length === 1 ? "Test" : "Tests"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="test-empty">Loading laboratory tests...</div>
        ) : tests.length === 0 ? (
          <div className="test-empty">No laboratory tests found.</div>
        ) : (
          <div className="test-table-wrapper">
            <table className="test-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test Name</th>
                  <th>Department</th>
                  <th>Sample Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td className="test-id-cell">{test.test_code}</td>

                    <td>
                      <div className="test-name-cell">{test.test_name}</div>

                      <div className="test-db-id">Database ID: {test.id}</div>
                    </td>

                    <td>{test.department || "-"}</td>

                    <td>{test.sample_type || "-"}</td>

                    <td>₹{Number(test.price).toFixed(2)}</td>

                    <td>
                      <span
                        className={
                          test.is_active
                            ? "test-active-status"
                            : "test-inactive-status"
                        }
                      >
                        {test.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td>
                      <div className="test-actions">
                        <button
                          className="test-view-button"
                          onClick={() => handleViewTest(test)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          VIEW TEST MODAL
          ================================================= */}

      {viewingTest && (
        <div className="test-modal-overlay">
          <div className="test-modal">
            <div className="test-modal-header">
              <div>
                <h2>Laboratory Test Details</h2>

                <p>View laboratory test information</p>
              </div>

              <button className="test-modal-close" onClick={closeViewModal}>
                ×
              </button>
            </div>

            <div className="test-view-grid">
              <div className="test-view-item">
                <span>Test ID</span>

                <strong>{viewingTest.test_code}</strong>
              </div>

              <div className="test-view-item">
                <span>Database ID</span>

                <strong>{viewingTest.id}</strong>
              </div>

              <div className="test-view-item">
                <span>Test Name</span>

                <strong>{viewingTest.test_name}</strong>
              </div>

              <div className="test-view-item">
                <span>Department</span>

                <strong>{viewingTest.department || "-"}</strong>
              </div>

              <div className="test-view-item">
                <span>Sample Type</span>

                <strong>{viewingTest.sample_type || "-"}</strong>
              </div>

              <div className="test-view-item">
                <span>Price</span>

                <strong>₹{Number(viewingTest.price).toFixed(2)}</strong>
              </div>

              <div className="test-view-item">
                <span>Status</span>

                <strong>{viewingTest.is_active ? "ACTIVE" : "INACTIVE"}</strong>
              </div>

              <div className="test-view-item">
                <span>Created</span>

                <strong>
                  {viewingTest.created_at
                    ? new Date(viewingTest.created_at).toLocaleString()
                    : "-"}
                </strong>
              </div>
            </div>

            <div className="test-view-actions">
              <button className="test-form-cancel" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TestManagement;
