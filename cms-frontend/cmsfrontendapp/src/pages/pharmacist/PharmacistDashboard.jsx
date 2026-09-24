import { useEffect, useMemo, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function PharmacistDashboard() {
// ==========================================
// STATE
// ==========================================

const [medicines, setMedicines] = useState([]);
const [bills, setBills] = useState([]);

const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

const [medicineSearch, setMedicineSearch] =
useState("");

const [billSearch, setBillSearch] =
useState("");

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================

const loadDashboardData = async (
showRefresh = false
) => {
try {
if (showRefresh) {
setRefreshing(true);
} else {
setLoading(true);
}


  setError("");

  const [
    medicinesResponse,
    billsResponse,
  ] = await Promise.all([
    pharmacyapi.get("pharmacist/medicines/"),
    pharmacyapi.get("pharmacist/bills/"),
  ]);

  setMedicines(
    Array.isArray(
      medicinesResponse.data
    )
      ? medicinesResponse.data
      : []
  );

  setBills(
    Array.isArray(
      billsResponse.data
    )
      ? billsResponse.data
      : []
  );

} catch (error) {
  console.error(
    "Dashboard loading error:",
    error
  );

  setError(
    "Unable to load dashboard data. Please check the Django backend."
  );

} finally {
  setLoading(false);
  setRefreshing(false);
}


};

// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

useEffect(() => {
let cancelled = false;

const fetchDashboardData = async () => {
try {
const [
medicinesResponse,
billsResponse,
] = await Promise.all([
pharmacyapi.get("pharmacist/medicines/"),
pharmacyapi.get("pharmacist/bills/"),
]);

if (!cancelled) {
setMedicines(
Array.isArray(medicinesResponse.data)
? medicinesResponse.data
: []
);

setBills(
Array.isArray(billsResponse.data)
? billsResponse.data
: []
);

setError("");
setLoading(false);
}
} catch (error) {
console.error(
"Dashboard loading error:",
error
);

if (!cancelled) {
setError(
"Unable to load dashboard data. Please check the Django backend."
);
setLoading(false);
}
}
};

fetchDashboardData();

return () => {
cancelled = true;
};
}, []);

// ==========================================
// DATE VALUES
// ==========================================

const today =
new Date()
.toISOString()
.split("T")[0];

const currentMonth =
new Date().getMonth();

const currentYear =
new Date().getFullYear();

// ==========================================
// TOTAL MEDICINES
// ==========================================

const totalMedicines =
medicines.length;

// ==========================================
// TOTAL STOCK
// ==========================================

const totalStock =
medicines.reduce(
(total, medicine) =>
total +
Number(
medicine.stock || 0
),
0
);

// ==========================================
// LOW STOCK MEDICINES
// ==========================================

const lowStockList =
medicines.filter(
(medicine) => {
const stock =
Number(
medicine.stock || 0
);


    return (
      stock > 0 &&
      stock < 20
    );
  }
);


const lowStockMedicines =
lowStockList.length;

// ==========================================
// OUT OF STOCK MEDICINES
// ==========================================

const outOfStockList =
medicines.filter(
(medicine) =>
Number(
medicine.stock || 0
) === 0
);

const outOfStockMedicines =
outOfStockList.length;

// ==========================================
// EXPIRED MEDICINES
// ==========================================

const expiredMedicines =
medicines.filter(
(medicine) => {
if (!medicine.expiry_date) {
return false;
}


    const expiryDate =
      new Date(
        medicine.expiry_date
      );

    const todayDate =
      new Date();

    expiryDate.setHours(
      0,
      0,
      0,
      0
    );

    todayDate.setHours(
      0,
      0,
      0,
      0
    );

    return (
      expiryDate <
      todayDate
    );
  }
);


// ==========================================
// EXPIRING SOON MEDICINES
// ==========================================

const expiringSoonMedicines =
medicines.filter(
(medicine) => {
if (!medicine.expiry_date) {
return false;
}


    const expiryDate =
      new Date(
        medicine.expiry_date
      );

    const todayDate =
      new Date();

    const difference =
      expiryDate -
      todayDate;

    const daysRemaining =
      Math.ceil(
        difference /
        (
          1000 *
          60 *
          60 *
          24
        )
      );

    return (
      daysRemaining >= 0 &&
      daysRemaining <= 30
    );
  }
);


// ==========================================
// TODAY'S SALES
// ==========================================

const todaysBills =
bills.filter(
(bill) => {
if (!bill.bill_date) {
return false;
}


    return (
      bill.bill_date
        .split("T")[0] ===
      today
    );
  }
);


const todaysSales =
todaysBills.reduce(
(total, bill) =>
total +
Number(
bill.total_amount || 0
),
0
);

// ==========================================
// THIS MONTH SALES
// ==========================================

const monthlyBills =
bills.filter(
(bill) => {
if (!bill.bill_date) {
return false;
}


    const billDate =
      new Date(
        bill.bill_date
      );

    return (
      billDate.getMonth() ===
        currentMonth &&
      billDate.getFullYear() ===
        currentYear
    );
  }
);


const monthlySales =
monthlyBills.reduce(
(total, bill) =>
total +
Number(
bill.total_amount || 0
),
0
);

// ==========================================
// TOTAL SALES
// ==========================================

const totalSales =
bills.reduce(
(total, bill) =>
total +
Number(
bill.total_amount || 0
),
0
);

// ==========================================
// RECENT BILLS
// ==========================================

const recentBills =
useMemo(
() => {
return [...bills]
.sort(
(a, b) =>
new Date(
b.bill_date
) -
new Date(
a.bill_date
)
)
.slice(
0,
5
);
},
[bills]
);

// ==========================================
// MEDICINE SEARCH
// ==========================================

const filteredMedicines =
useMemo(
() => {
const search =
medicineSearch
.trim()
.toLowerCase();


    if (!search) {
      return medicines;
    }

    return medicines.filter(
      (medicine) =>
        medicine.name
          ?.toLowerCase()
          .includes(
            search
          ) ||
        medicine.batch_no
          ?.toLowerCase()
          .includes(
            search
          ) ||
        medicine.medicine_type
          ?.toLowerCase()
          .includes(
            search
          )
    );
  },
  [
    medicines,
    medicineSearch,
  ]
);


// ==========================================
// BILL SEARCH
// ==========================================

const filteredBills =
useMemo(
() => {
const search =
billSearch
.trim()
.toLowerCase();


    if (!search) {
      return recentBills;
    }

    return recentBills.filter(
      (bill) =>
        bill.bill_number
          ?.toLowerCase()
          .includes(
            search
          ) ||
        bill.patient_name
          ?.toLowerCase()
          .includes(
            search
          ) ||
        bill.patient_id
          ?.toLowerCase()
          .includes(
            search
          )
    );
  },
  [
    recentBills,
    billSearch,
  ]
);


// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (
dateValue
) => {
if (!dateValue) {
return "-";
}


return new Date(
  dateValue
).toLocaleDateString(
  "en-IN"
);


};

// ==========================================
// FORMAT DATE AND TIME
// ==========================================

const formatDateTime = (
dateValue
) => {
if (!dateValue) {
return "-";
}


return new Date(
  dateValue
).toLocaleString(
  "en-IN"
);


};

// ==========================================
// FORMAT MONEY
// ==========================================

const formatMoney = (
amount
) => {
return Number(
amount || 0
).toLocaleString(
"en-IN",
{
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}
);
};

// ==========================================
// GET MEDICINE STATUS
// ==========================================

const getMedicineStatus = (
medicine
) => {
const stock =
Number(
medicine.stock || 0
);


if (stock === 0) {
  return "Out of Stock";
}

if (stock < 20) {
  return "Low Stock";
}

return "Available";


};

// ==========================================
// LOADING
// ==========================================

if (loading) {
return ( <div
     className="dashboard"
   > <h1>
Pharmacy Dashboard </h1>


    <p>
      Loading dashboard data...
    </p>
  </div>
);


}

// ==========================================
// ERROR
// ==========================================

if (error) {
return ( <div
     className="dashboard"
   > <h1>
Pharmacy Dashboard </h1>


    <p
      style={{
        color: "red",
      }}
    >
      {error}
    </p>

    <button
      onClick={() =>
        loadDashboardData()
      }
    >
      Try Again
    </button>
  </div>
);


}

// ==========================================
// MAIN DASHBOARD
// ==========================================

return ( <div
   className="dashboard"
 >


  {/* ================================= */}
  {/* HEADER */}
  {/* ================================= */}

  <div
    className="dashboard-header"
  >

    <div>
      <h1>
        Pharmacy Dashboard
      </h1>

      <p>
        Monitor inventory,
        medicine stock and
        pharmacy sales.
      </p>
    </div>


    <button
      className="dashboard-refresh-button"
      onClick={() =>
        loadDashboardData(
          true
        )
      }
      disabled={
        refreshing
      }
    >
      {refreshing
        ? "Refreshing..."
        : "Refresh"}
    </button>

  </div>


  {/* ================================= */}
  {/* PRIMARY STATISTICS */}
  {/* ================================= */}

  <div
    className="dashboard-cards"
  >

    <div className="card">

      <h3>
        Total Medicines
      </h3>

      <h2>
        {totalMedicines}
      </h2>

      <p>
        Medicine records
      </p>

    </div>


    <div className="card">

      <h3>
        Total Stock
      </h3>

      <h2>
        {totalStock.toLocaleString(
          "en-IN"
        )}
      </h2>

      <p>
        Total units available
      </p>

    </div>


    <div className="card">

      <h3>
        Low Stock
      </h3>

      <h2>
        {lowStockMedicines}
      </h2>

      <p>
        Below 20 units
      </p>

    </div>


    <div className="card">

      <h3>
        Out of Stock
      </h3>

      <h2>
        {outOfStockMedicines}
      </h2>

      <p>
        Medicines unavailable
      </p>

    </div>

  </div>


  {/* ================================= */}
  {/* SALES STATISTICS */}
  {/* ================================= */}

  <div
    className="dashboard-cards"
  >

    <div className="card">

      <h3>
        Today's Sales
      </h3>

      <h2>
        ₹{" "}
        {formatMoney(
          todaysSales
        )}
      </h2>

      <p>
        {todaysBills.length}
        {" "}
        bill(s) today
      </p>

    </div>


    <div className="card">

      <h3>
        This Month
      </h3>

      <h2>
        ₹{" "}
        {formatMoney(
          monthlySales
        )}
      </h2>

      <p>
        {monthlyBills.length}
        {" "}
        bill(s) this month
      </p>

    </div>


    <div className="card">

      <h3>
        Total Sales
      </h3>

      <h2>
        ₹{" "}
        {formatMoney(
          totalSales
        )}
      </h2>

      <p>
        All pharmacy sales
      </p>

    </div>


    <div className="card">

      <h3>
        Total Bills
      </h3>

      <h2>
        {bills.length}
      </h2>

      <p>
        Bills generated
      </p>

    </div>

  </div>


  {/* ================================= */}
  {/* ALERT SECTION */}
  {/* ================================= */}

  <div
    className="dashboard-content"
  >

    {/* LOW STOCK */}

    <div
      className="dashboard-panel"
    >

      <h2>
        Low Stock Alert
      </h2>


      {lowStockList.length ===
      0 ? (

        <p
          className="no-data"
        >
          No low stock medicines.
        </p>

      ) : (

        <div
          className="table-container"
        >

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Batch No.
                </th>

                <th>
                  Stock
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {lowStockList.map(
                (medicine) => (

                  <tr
                    key={
                      medicine.id
                    }
                  >

                    <td>
                      {medicine.name}
                    </td>


                    <td>
                      {medicine.batch_no}
                    </td>


                    <td>
                      {medicine.stock}
                    </td>


                    <td>

                      <span
                        className="low-stock-badge"
                      >
                        Low Stock
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>


    {/* EXPIRY ALERT */}

    <div
      className="dashboard-panel"
    >

      <h2>
        Medicine Expiry Alerts
      </h2>


      <p>
        Expired:{" "}

        <strong>
          {
            expiredMedicines.length
          }
        </strong>

        {" | "}

        Expiring within 30 days:{" "}

        <strong>
          {
            expiringSoonMedicines.length
          }
        </strong>
      </p>


      {expiredMedicines.length ===
        0 &&
      expiringSoonMedicines.length ===
        0 ? (

        <p
          className="no-data"
        >
          No medicine expiry alerts.
        </p>

      ) : (

        <div
          className="table-container"
        >

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Batch No.
                </th>

                <th>
                  Expiry Date
                </th>

                <th>
                  Alert
                </th>

              </tr>

            </thead>


            <tbody>

              {expiredMedicines.map(
                (medicine) => (

                  <tr
                    key={
                      `expired-${medicine.id}`
                    }
                  >

                    <td>
                      {medicine.name}
                    </td>


                    <td>
                      {medicine.batch_no}
                    </td>


                    <td>
                      {formatDate(
                        medicine.expiry_date
                      )}
                    </td>


                    <td>

                      <span
                        className="expired-badge"
                      >
                        Expired
                      </span>

                    </td>

                  </tr>

                )
              )}


              {expiringSoonMedicines.map(
                (medicine) => (

                  <tr
                    key={
                      `expiring-${medicine.id}`
                    }
                  >

                    <td>
                      {medicine.name}
                    </td>


                    <td>
                      {medicine.batch_no}
                    </td>


                    <td>
                      {formatDate(
                        medicine.expiry_date
                      )}
                    </td>


                    <td>

                      <span
                        className="expiring-badge"
                      >
                        Expiring Soon
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  </div>


  {/* ================================= */}
  {/* INVENTORY SEARCH */}
  {/* ================================= */}

  <div
    className="dashboard-panel"
  >

    <div
      className="dashboard-section-header"
    >

      <h2>
        Medicine Inventory Overview
      </h2>


      <input
        type="text"
        placeholder="Search medicine, batch number or type..."
        value={
          medicineSearch
        }
        onChange={(e) =>
          setMedicineSearch(
            e.target.value
          )
        }
      />

    </div>


    <div
      className="table-container"
    >

      <table>

        <thead>

          <tr>

            <th>
              Medicine
            </th>

            <th>
              Type
            </th>

            <th>
              Batch No.
            </th>

            <th>
              Expiry Date
            </th>

            <th>
              Stock
            </th>

            <th>
              Price
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>


        <tbody>

          {filteredMedicines.length ===
          0 ? (

            <tr>

              <td
                colSpan="7"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "20px",
                }}
              >
                No medicines found.
              </td>

            </tr>

          ) : (

            filteredMedicines.map(
              (medicine) => (

                <tr
                  key={
                    medicine.id
                  }
                >

                  <td>
                    {medicine.name}
                  </td>


                  <td>
                    {
                      medicine.medicine_type
                    }
                  </td>


                  <td>
                    {
                      medicine.batch_no
                    }
                  </td>


                  <td>
                    {formatDate(
                      medicine.expiry_date
                    )}
                  </td>


                  <td>
                    {medicine.stock}
                  </td>


                  <td>
                    ₹{" "}

                    {Number(
                      medicine.price
                    ).toFixed(2)}

                  </td>


                  <td>

                    <span
                      className={
                        getMedicineStatus(
                          medicine
                        )
                          .toLowerCase()
                          .replace(
                            /\s/g,
                            "-"
                          )
                      }
                    >

                      {
                        getMedicineStatus(
                          medicine
                        )
                      }

                    </span>

                  </td>

                </tr>

              )
            )

          )}

        </tbody>

      </table>

    </div>

  </div>


  {/* ================================= */}
  {/* RECENT BILLS */}
  {/* ================================= */}

  <div
    className="dashboard-panel"
  >

    <div
      className="dashboard-section-header"
    >

      <h2>
        Recent Bills
      </h2>


      <input
        type="text"
        placeholder="Search bill or patient..."
        value={
          billSearch
        }
        onChange={(e) =>
          setBillSearch(
            e.target.value
          )
        }
      />

    </div>


    <div
      className="table-container"
    >

      <table>

        <thead>

          <tr>

            <th>
              Bill Number
            </th>

            <th>
              Patient Name
            </th>

            <th>
              Patient ID
            </th>

            <th>
              Total Amount
            </th>

            <th>
              Payment Method
            </th>

            <th>
              Bill Date
            </th>

          </tr>

        </thead>


        <tbody>

          {filteredBills.length ===
          0 ? (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "20px",
                }}
              >
                No bills found.
              </td>

            </tr>

          ) : (

            filteredBills.map(
              (bill) => (

                <tr
                  key={
                    bill.id
                  }
                >

                  <td>
                    {
                      bill.bill_number
                    }
                  </td>


                  <td>
                    {
                      bill.patient_name
                    }
                  </td>


                  <td>
                    {
                      bill.patient_id
                    }
                  </td>


                  <td>
                    ₹{" "}

                    {formatMoney(
                      bill.total_amount
                    )}

                  </td>


                  <td>
                    {
                      bill.payment_method
                    }
                  </td>


                  <td>
                    {formatDateTime(
                      bill.bill_date
                    )}
                  </td>

                </tr>

              )
            )

          )}

        </tbody>

      </table>

    </div>

  </div>


  {/* ================================= */}
  {/* SUMMARY */}
  {/* ================================= */}

  <div
    className="dashboard-summary"
  >

    <h2>
      Pharmacy Summary
    </h2>


    <div
      className="summary-items"
    >

      <p>
        Medicines in Inventory:{" "}

        <strong>
          {totalMedicines}
        </strong>
      </p>


      <p>
        Total Units Available:{" "}

        <strong>
          {totalStock.toLocaleString(
            "en-IN"
          )}
        </strong>
      </p>


      <p>
        Low Stock Medicines:{" "}

        <strong>
          {lowStockMedicines}
        </strong>
      </p>


      <p>
        Out of Stock Medicines:{" "}

        <strong>
          {
            outOfStockMedicines
          }
        </strong>
      </p>


      <p>
        Expired Medicines:{" "}

        <strong>
          {
            expiredMedicines.length
          }
        </strong>
      </p>


      <p>
        Total Bills Generated:{" "}

        <strong>
          {bills.length}
        </strong>
      </p>


      <p>
        Total Pharmacy Sales:{" "}

        <strong>
          ₹{" "}

          {formatMoney(
            totalSales
          )}
        </strong>
      </p>

    </div>

  </div>

</div>


);
}

export default PharmacistDashboard;
