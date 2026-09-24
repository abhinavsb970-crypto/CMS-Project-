
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LaboratoryBillDetails.css";

function LaboratoryBillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBill = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

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

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load laboratory bill."
        );
      }

      setBill(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const handlePayment = async () => {
    if (!bill || bill.payment_status === "PAID") {
      return;
    }

    setProcessingPayment(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");

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

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to record payment."
        );
      }

      setBill(data.bill);
      setSuccess("Payment recorded successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert(
      "Report and bill sharing will be connected after the Patient module is completed."
    );
  };

  if (loading) {
    return (
      <div className="laboratory-bill-details-page">
        <div className="laboratory-bill-loading">
          Loading laboratory bill...
        </div>
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="laboratory-bill-details-page">
        <div className="laboratory-bill-error">
          {error}
        </div>

        <button
          className="laboratory-bill-back-button"
          onClick={() =>
            navigate("/lab-technician/billing")
          }
        >
          ← Back to Billing
        </button>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  const isPaid = bill.payment_status === "PAID";

  return (
    <div className="laboratory-bill-details-page">

      {/* ACTION BUTTONS */}

      <div className="laboratory-bill-actions no-print">

        <button
          className="laboratory-bill-back-button"
          onClick={() =>
            navigate("/lab-technician/billing")
          }
        >
          ← Back to Billing
        </button>

        <div className="laboratory-bill-action-group">

          <button
            className="laboratory-bill-print-button"
            onClick={handlePrint}
          >
            🖨 Print Bill
          </button>

          {isPaid && (
            <button
              className="laboratory-bill-share-button"
              onClick={handleShare}
            >
              Share Report + Bill
            </button>
          )}

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="laboratory-bill-error no-print">
          {error}
        </div>
      )}


      {/* SUCCESS */}

      {success && (
        <div className="laboratory-bill-success no-print">
          {success}
        </div>
      )}


      {/* BILL DOCUMENT */}

      <div className="laboratory-bill-document">

        <div className="laboratory-bill-header">

          <div className="laboratory-bill-clinic">
            <h1>CLINIC MANAGEMENT SYSTEM</h1>
            <p>Laboratory Department</p>
          </div>

          <div className="laboratory-bill-title">
            <h2>LABORATORY BILL</h2>
            <p>
              Bill ID: <strong>{bill.bill_id}</strong>
            </p>
          </div>

        </div>


        <div className="laboratory-bill-divider"></div>


        {/* PATIENT INFORMATION */}

        <section className="laboratory-bill-section">

          <h3>Patient Information</h3>

          <div className="laboratory-bill-grid">

            <div className="laboratory-bill-field">
              <span>Patient ID</span>
              <strong>{bill.patient_id || "-"}</strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Request ID</span>
              <strong>{bill.request_id || "-"}</strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Report ID</span>
              <strong>{bill.report_id || "-"}</strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Bill Date</span>
              <strong>
                {bill.created_at
                  ? new Date(
                      bill.created_at
                    ).toLocaleDateString()
                  : "-"}
              </strong>
            </div>

          </div>

        </section>


        {/* TEST INFORMATION */}

        <section className="laboratory-bill-section">

          <h3>Laboratory Test</h3>

          <div className="laboratory-bill-grid">

            <div className="laboratory-bill-field">
              <span>Test Code</span>
              <strong>{bill.test_code || "-"}</strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Test Name</span>
              <strong>{bill.test_name || "-"}</strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Sample Type</span>
              <strong>{bill.sample_type || "-"}</strong>
            </div>

          </div>

        </section>


        {/* AMOUNT */}

        <section className="laboratory-bill-section">

          <h3>Billing Summary</h3>

          <div className="laboratory-bill-amount-box">

            <span>Laboratory Test Amount</span>

            <strong>
              ₹{Number(bill.amount || 0).toFixed(2)}
            </strong>

          </div>

        </section>


        {/* PAYMENT DETAILS */}

        <section className="laboratory-bill-section">

          <h3>Payment Details</h3>

          <div className="laboratory-bill-grid">

            <div className="laboratory-bill-field">
              <span>Payment Status</span>

              <strong
                className={`laboratory-bill-payment-status ${
                  isPaid ? "paid" : "pending"
                }`}
              >
                {bill.payment_status}
              </strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Payment Method</span>
              <strong>
                {bill.payment_method || "Not Paid"}
              </strong>
            </div>

            <div className="laboratory-bill-field">
              <span>Paid At</span>
              <strong>
                {bill.paid_at
                  ? new Date(
                      bill.paid_at
                    ).toLocaleString()
                  : "Not Paid"}
              </strong>
            </div>

          </div>

        </section>


        {/* PAYMENT FORM */}

        {!isPaid && (
          <section className="laboratory-bill-payment-card no-print">

            <h3>Record Payment</h3>

            <p>
              Select the payment method and confirm the
              laboratory bill payment.
            </p>

            <div className="laboratory-bill-payment-form">

              <label htmlFor="paymentMethod">
                Payment Method
              </label>

              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="ONLINE">Online</option>
              </select>

              <button
                className="laboratory-bill-pay-button"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment
                  ? "Processing Payment..."
                  : "Confirm Payment"}
              </button>

            </div>

          </section>
        )}


        {/* PAID MESSAGE */}

        {isPaid && (
          <div className="laboratory-bill-paid-message no-print">
            ✓ Payment completed successfully. The report
            and bill can now be shared.
          </div>
        )}


        {/* FOOTER */}

        <div className="laboratory-bill-footer">
          <p>
            This bill was generated through the Clinic
            Management System.
          </p>

          <p>
            Bill ID: {bill.bill_id}
          </p>
        </div>

      </div>

    </div>
  );
}

export default LaboratoryBillDetails;
