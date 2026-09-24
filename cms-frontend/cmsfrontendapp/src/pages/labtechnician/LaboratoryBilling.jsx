import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./LaboratoryBilling.css";

function LaboratoryBilling() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchType, setSearchType] = useState("bill_id");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/bills/",
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
        setError(data.detail || "Unable to load laboratory bills.");
        setLoading(false);
        return;
      }

      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("LABORATORY BILLING ERROR:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const value = searchValue.trim().toLowerCase();

    if (!value) {
      return;
    }

    const filteredBills = bills.filter((bill) => {
      let fieldValue = "";

      if (searchType === "bill_id") {
        fieldValue = bill.bill_id || "";
      }

      if (searchType === "report_id") {
        fieldValue = bill.report_id || "";
      }

      if (searchType === "patient_id") {
        fieldValue = String(bill.patient_id || "");
      }

      if (searchType === "test_name") {
        fieldValue = bill.test_name || "";
      }

      return fieldValue.toLowerCase().includes(value);
    });

    setBills(filteredBills);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    fetchBills();
  };

  const handleViewBill = (bill) => {
    navigate(`/lab-technician/billing/${bill.bill_id}`);
  };

  const getPaymentClass = (status) => {
    if (status === "PAID") {
      return "laboratory-billing-paid";
    }

    if (status === "CANCELLED") {
      return "laboratory-billing-cancelled";
    }

    return "laboratory-billing-pending";
  };

  return (
    <section className="laboratory-billing-page">
      {/* PAGE HEADER */}
      <div className="laboratory-billing-header">
        <div>
          <h2>Laboratory Billing</h2>

          <p>Manage laboratory bills and payment records</p>
        </div>

        <button
          className="laboratory-billing-refresh-button"
          onClick={fetchBills}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="laboratory-billing-error">{error}</div>}

      {/* SEARCH CARD */}
      <div className="laboratory-billing-search-card">
        <div className="laboratory-billing-search-title">
          <h3>Search By</h3>
        </div>

        <div className="laboratory-billing-search-form">
          <div className="laboratory-billing-search-field">
            <label htmlFor="billing-search-type">Search By</label>

            <select
              id="billing-search-type"
              value={searchType}
              onChange={(event) => setSearchType(event.target.value)}
            >
              <option value="bill_id">Bill ID</option>

              <option value="report_id">Report ID</option>

              <option value="patient_id">Patient ID</option>

              <option value="test_name">Test Name</option>
            </select>
          </div>

          <div className="laboratory-billing-search-field">
            <label htmlFor="billing-search-value">Search</label>

            <input
              id="billing-search-value"
              type="text"
              value={searchValue}
              placeholder="Enter search value..."
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <button
            className="laboratory-billing-search-button"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            className="laboratory-billing-clear-button"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </div>
      </div>

      {/* BILL LIST */}
      <div className="laboratory-billing-card">
        <div className="laboratory-billing-list-header">
          <div>
            <h2>Laboratory Bills</h2>

            <p>
              {bills.length} {bills.length === 1 ? "bill" : "bills"}
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="laboratory-billing-empty">
            Loading laboratory bills...
          </div>
        ) : bills.length === 0 ? (
          /* EMPTY */
          <div className="laboratory-billing-empty">
            No laboratory bills found.
          </div>
        ) : (
          /* TABLE */
          <div className="laboratory-billing-table-wrapper">
            <table className="laboratory-billing-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Report ID</th>
                  <th>Patient ID</th>
                  <th>Test Code</th>
                  <th>Test Name</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Payment Method</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    {/* BILL ID */}
                    <td>
                      <span className="laboratory-billing-bill-id">
                        {bill.bill_id}
                      </span>
                    </td>

                    {/* REPORT ID */}
                    <td>{bill.report_id || "-"}</td>

                    {/* PATIENT ID */}
                    <td>{bill.patient_id || "-"}</td>

                    {/* TEST CODE */}
                    <td>{bill.test_code || "-"}</td>

                    {/* TEST NAME */}
                    <td>
                      <span className="laboratory-billing-test-name">
                        {bill.test_name || "-"}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td>
                      <strong>₹{Number(bill.amount || 0).toFixed(2)}</strong>
                    </td>

                    {/* PAYMENT STATUS */}
                    <td>
                      <span
                        className={`laboratory-billing-payment-status ${getPaymentClass(
                          bill.payment_status,
                        )}`}
                      >
                        {bill.payment_status || "PENDING"}
                      </span>
                    </td>

                    {/* PAYMENT METHOD */}
                    <td>{bill.payment_method || "-"}</td>

                    {/* CREATED */}
                    <td>
                      {bill.created_at
                        ? new Date(bill.created_at).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTION */}
                    <td>
                      <button
                        className="laboratory-billing-view-button"
                        onClick={() => handleViewBill(bill)}
                      >
                        View Bill
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

export default LaboratoryBilling;
