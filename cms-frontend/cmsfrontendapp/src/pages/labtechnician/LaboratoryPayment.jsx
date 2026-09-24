
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./LaboratoryPayment.css";

function LaboratoryPayment() {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // FETCH BILL
  // ==========================================================

  const fetchBill = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/bills/${billId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load laboratory bill."
        );
      }

      setBill(data);
    } catch (err) {
      console.error("PAYMENT PAGE ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  // ==========================================================
  // PAYMENT
  // ==========================================================

  const handlePayment = async () => {
    if (!bill) {
      return;
    }

    if (bill.payment_status === "PAID") {
      setSuccess("This bill has already been paid.");
      return;
    }

    setProcessingPayment(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Your login session has expired. Please login again.");
        setProcessingPayment(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/bills/${billId}/pay/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setProcessingPayment(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Payment could not be completed."
        );
      }

      setBill(data.bill);

      setSuccess(
        "Payment recorded successfully."
      );
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="laboratory-payment-page">
        <div className="laboratory-payment-loading">
          Loading payment details...
        </div>
      </section>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !bill) {
    return (
      <section className="laboratory-payment-page">

        <div className="laboratory-payment-error">
          {error}
        </div>

        <button
          className="laboratory-payment-back-button"
          onClick={() =>
            navigate("/lab-technician/reports")
          }
        >
          ← Back to Reports
        </button>

      </section>
    );
  }

  if (!bill) {
    return null;
  }

  const isPaid = bill.payment_status === "PAID";

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <section className="laboratory-payment-page">

      {/* HEADER */}

      <div className="laboratory-payment-header">

        <div>
          <h2>Laboratory Payment</h2>

          <p>
            Complete payment for the laboratory test
          </p>
        </div>

        <button
          className="laboratory-payment-back-button"
          onClick={() =>
            navigate("/lab-technician/reports")
          }
        >
          ← Back to Reports
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="laboratory-payment-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="laboratory-payment-success">
          ✓ {success}
        </div>
      )}

      {/* PAYMENT CARD */}

      <div className="laboratory-payment-card">

        <div className="laboratory-payment-card-header">

          <div>
            <h3>Payment Details</h3>

            <p>
              Laboratory bill information
            </p>
          </div>

          <span
            className={`laboratory-payment-status ${
              isPaid
                ? "laboratory-payment-status-paid"
                : "laboratory-payment-status-pending"
            }`}
          >
            {bill.payment_status}
          </span>

        </div>

        {/* BILL INFORMATION */}

        <div className="laboratory-payment-information">

          <div className="laboratory-payment-field">
            <span>Bill ID</span>
            <strong>{bill.bill_id}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Report ID</span>
            <strong>{bill.report_id || "-"}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Request ID</span>
            <strong>{bill.request_id || "-"}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Patient ID</span>
            <strong>{bill.patient_id || "-"}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Test Code</span>
            <strong>{bill.test_code || "-"}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Test Name</span>
            <strong>{bill.test_name || "-"}</strong>
          </div>

          <div className="laboratory-payment-field">
            <span>Sample Type</span>
            <strong>{bill.sample_type || "-"}</strong>
          </div>

        </div>

        {/* AMOUNT */}

        <div className="laboratory-payment-amount">

          <span>Total Amount</span>

          <strong>
            ₹{Number(bill.amount || 0).toFixed(2)}
          </strong>

        </div>

        {/* PAYMENT SECTION */}

        {!isPaid ? (

          <div className="laboratory-payment-method-section">

            <h3>Select Payment Method</h3>

            <p>
              Select how the laboratory bill will be paid.
            </p>

            <div className="laboratory-payment-methods">

              <label
                className={`laboratory-payment-method ${
                  paymentMethod === "CASH"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>Cash</strong>
                  <span>Cash payment</span>
                </div>

              </label>

              <label
                className={`laboratory-payment-method ${
                  paymentMethod === "UPI"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>UPI</strong>
                  <span>UPI payment</span>
                </div>

              </label>

              <label
                className={`laboratory-payment-method ${
                  paymentMethod === "CARD"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>Card</strong>
                  <span>Debit / Credit Card</span>
                </div>

              </label>

              <label
                className={`laboratory-payment-method ${
                  paymentMethod === "ONLINE"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>Online</strong>
                  <span>Online payment</span>
                </div>

              </label>

            </div>

            <button
              className="laboratory-payment-confirm-button"
              onClick={handlePayment}
              disabled={processingPayment}
            >
              {processingPayment
                ? "Processing Payment..."
                : `Pay ₹${Number(
                    bill.amount || 0
                  ).toFixed(2)}`}
            </button>

          </div>

        ) : (

          <div className="laboratory-payment-completed">

            <div className="laboratory-payment-check">
              ✓
            </div>

            <h3>
              Payment Completed
            </h3>

            <p>
              This laboratory bill has been successfully paid.
            </p>

            <div className="laboratory-payment-paid-details">

              <div>
                <span>Payment Method</span>
                <strong>
                  {bill.payment_method || "-"}
                </strong>
              </div>

              <div>
                <span>Paid At</span>
                <strong>
                  {bill.paid_at
                    ? new Date(
                        bill.paid_at
                      ).toLocaleString()
                    : "-"}
                </strong>
              </div>

            </div>

            <div className="laboratory-payment-completed-actions">

              <button
                className="laboratory-payment-view-bill-button"
                onClick={() =>
                  navigate(
                    `/lab-technician/billing/${bill.bill_id}`
                  )
                }
              >
                View Bill
              </button>

              <button
                className="laboratory-payment-view-report-button"
                onClick={() =>
                  navigate(
                    `/lab-technician/reports/${bill.report_id}`
                  )
                }
              >
                View Report
              </button>

            </div>

          </div>

        )}

      </div>

    </section>
  );
}

export default LaboratoryPayment;
