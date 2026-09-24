import { useEffect, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function SalesReports() {
  // ==========================================
  // STATE
  // ==========================================

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");

  // ==========================================
  // LOAD BILLS
  // ==========================================

  const loadBills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await pharmacyapi.get(
        "pharmacist/bills/"
      );

      setBills(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error loading sales reports:",
        error
      );

      setError(
        "Unable to load sales reports. Please check the Django backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchBills = async () => {
      try {
        const response = await pharmacyapi.get(
          "pharmacist/bills/"
        );

        if (!cancelled) {
          setBills(
            Array.isArray(response.data)
              ? response.data
              : []
          );
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Error loading sales reports:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load sales reports. Please check the Django backend."
          );
          setLoading(false);
        }
      }
    };

    fetchBills();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // CALCULATE TOTAL SALES
  // ==========================================

  const totalSales = bills.reduce(
    (total, bill) =>
      total + (Number(bill.total_amount) || 0),
    0
  );

  // ==========================================
  // TODAY'S SALES
  // ==========================================

  const today = new Date();

  const todayString = today
    .toISOString()
    .split("T")[0];

  const todaysSales = bills
    .filter((bill) => {
      if (!bill.bill_date) {
        return false;
      }

      const billDate = new Date(bill.bill_date)
        .toISOString()
        .split("T")[0];

      return billDate === todayString;
    })
    .reduce(
      (total, bill) =>
        total + (Number(bill.total_amount) || 0),
      0
    );

  // ==========================================
  // TOTAL BILLS
  // ==========================================

  const totalBills = bills.length;

  // ==========================================
  // AVERAGE BILL
  // ==========================================

  const averageBill =
    totalBills > 0
      ? totalSales / totalBills
      : 0;

  // ==========================================
  // PAYMENT METHOD SALES
  // ==========================================

  const cashSales = bills
    .filter(
      (bill) =>
        bill.payment_method === "Cash"
    )
    .reduce(
      (total, bill) =>
        total +
        (Number(bill.total_amount) || 0),
      0
    );

  const cardSales = bills
    .filter(
      (bill) =>
        bill.payment_method === "Card"
    )
    .reduce(
      (total, bill) =>
        total +
        (Number(bill.total_amount) || 0),
      0
    );

  const upiSales = bills
    .filter(
      (bill) =>
        bill.payment_method === "UPI"
    )
    .reduce(
      (total, bill) =>
        total +
        (Number(bill.total_amount) || 0),
      0
    );

  // ==========================================
  // FILTER BILLS
  // ==========================================

  const filteredBills = bills.filter((bill) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      bill.patient_name
        ?.toLowerCase()
        .includes(searchText) ||
      String(bill.patient_id || "")
        .toLowerCase()
        .includes(searchText) ||
      bill.bill_number
        ?.toLowerCase()
        .includes(searchText);

    const matchesPayment =
      paymentFilter === "All" ||
      bill.payment_method === paymentFilter;

    return (
      matchesSearch &&
      matchesPayment
    );
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="reports">
        <h1>Sales Reports</h1>

        <p>
          Loading sales data...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="reports">
        <h1>Sales Reports</h1>

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>

        <button onClick={loadBills}>
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="reports">

      {/* HEADER */}

      <div className="reports-header">

        <div>
          <h1>
            Sales Reports
          </h1>

          <p>
            Monitor pharmacy sales and billing performance.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadBills}
        >
          Refresh
        </button>

      </div>

      {/* SALES SUMMARY */}

      <div className="sales-summary">

        <div className="summary-card">
          <h3>Total Sales</h3>

          <h2>
            ₹ {totalSales.toFixed(2)}
          </h2>
        </div>

        <div className="summary-card">
          <h3>Today's Sales</h3>

          <h2>
            ₹ {todaysSales.toFixed(2)}
          </h2>
        </div>

        <div className="summary-card">
          <h3>Total Bills</h3>

          <h2>
            {totalBills}
          </h2>
        </div>

        <div className="summary-card">
          <h3>Average Bill</h3>

          <h2>
            ₹ {averageBill.toFixed(2)}
          </h2>
        </div>

      </div>

      {/* PAYMENT SUMMARY */}

      <div className="payment-summary">

        <h2>
          Payment Method Summary
        </h2>

        <div className="payment-summary-cards">

          <div className="payment-card">
            <h3>Cash</h3>

            <p>
              ₹ {cashSales.toFixed(2)}
            </p>
          </div>

          <div className="payment-card">
            <h3>Card</h3>

            <p>
              ₹ {cardSales.toFixed(2)}
            </p>
          </div>

          <div className="payment-card">
            <h3>UPI</h3>

            <p>
              ₹ {upiSales.toFixed(2)}
            </p>
          </div>

        </div>

      </div>

      {/* SEARCH AND FILTER */}

      <div className="report-filters">

        <input
          type="text"
          placeholder="Search by patient, patient ID or bill number..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="All">
            All Payments
          </option>

          <option value="Cash">
            Cash
          </option>

          <option value="Card">
            Card
          </option>

          <option value="UPI">
            UPI
          </option>
        </select>

      </div>

      {/* SALES TABLE */}

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Bill Date</th>
            </tr>
          </thead>

          <tbody>

            {filteredBills.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No sales records found.
                </td>
              </tr>

            ) : (

              filteredBills.map((bill) => (

                <tr key={bill.id}>

                  <td>
                    {bill.bill_number}
                  </td>

                  <td>
                    {bill.patient_name}
                  </td>

                  <td>
                    {bill.patient_id}
                  </td>

                  <td>
                    ₹{" "}
                    {Number(
                      bill.total_amount
                    ).toFixed(2)}
                  </td>

                  <td>
                    {bill.payment_method}
                  </td>

                  <td>
                    {bill.bill_date
                      ? new Date(
                          bill.bill_date
                        ).toLocaleString()
                      : "-"}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default SalesReports;