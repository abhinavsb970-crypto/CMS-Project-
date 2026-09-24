
import { useEffect, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function PharmacyBilling() {
  // ==========================================
  // STATE
  // ==========================================

  const [issuedPrescriptions, setIssuedPrescriptions] =
    useState([]);

  const [bills, setBills] = useState([]);

  const [searchPatient, setSearchPatient] =
    useState("");

  const [
    selectedPrescription,
    setSelectedPrescription,
  ] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [generatedBill, setGeneratedBill] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD ISSUED PRESCRIPTIONS
  // ==========================================

  const loadIssuedPrescriptions =
    async () => {
      try {
        const response = await pharmacyapi.get(
          "pharmacist/issued-prescriptions/"
        );

        setIssuedPrescriptions(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Error loading issued prescriptions:",
          error
        );

        throw error;
      }
    };

  // ==========================================
  // LOAD BILLS
  // ==========================================

  const loadBills = async () => {
    try {
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
        "Error loading bills:",
        error
      );

      throw error;
    }
  };

  // ==========================================
  // LOAD PAGE DATA
  // ==========================================

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadIssuedPrescriptions(),
        loadBills(),
      ]);
    } catch (error) {
      setError(
        "Unable to load billing data. Please check the Django backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchPageData = async () => {
      try {
        const [
          issuedPrescriptionsResponse,
          billsResponse,
        ] = await Promise.all([
          pharmacyapi.get("pharmacist/issued-prescriptions/"),
          pharmacyapi.get("pharmacist/bills/"),
        ]);

        if (!cancelled) {
          setIssuedPrescriptions(
            Array.isArray(issuedPrescriptionsResponse.data)
              ? issuedPrescriptionsResponse.data
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
        console.error("Error loading billing data:", error);

        if (!cancelled) {
          setError(
            "Unable to load billing data. Please check the Django backend."
          );
          setLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // CHECK IF PRESCRIPTION IS ALREADY BILLED
  // ==========================================

  const isAlreadyBilled =
    (issuedPrescription) => {
      return bills.some(
        (bill) =>
          Number(
            bill.issued_prescription
          ) ===
          Number(
            issuedPrescription.id
          )
      );
    };

  // ==========================================
  // FILTER PRESCRIPTIONS
  // ==========================================

  const filteredPrescriptions =
    issuedPrescriptions.filter(
      (issuedPrescription) => {
        const patientName =
          issuedPrescription.patient_name ||
          "";

        const patientId =
          issuedPrescription.patient_id ||
          "";

        const search =
          searchPatient
            .trim()
            .toLowerCase();

        return (
          !isAlreadyBilled(
            issuedPrescription
          ) &&
          (
            patientName
              .toLowerCase()
              .includes(search) ||
            patientId
              .toLowerCase()
              .includes(search)
          )
        );
      }
    );

  // ==========================================
  // CALCULATE TOTAL
  // ==========================================

  const calculateTotal = () => {
    if (!selectedPrescription) {
      return 0;
    }

    if (
      !Array.isArray(
        selectedPrescription.medicines
      )
    ) {
      return 0;
    }

    return selectedPrescription.medicines.reduce(
      (total, medicine) => {
        const quantity =
          Number(
            medicine.issued_quantity
          ) || 0;

        const price =
          Number(
            medicine.price_at_issue
          ) || 0;

        return (
          total +
          quantity * price
        );
      },
      0
    );
  };

  // ==========================================
  // GENERATE BILL
  // ==========================================

  const handleGenerateBill =
    async () => {
      if (!selectedPrescription) {
        alert(
          "Please select a patient."
        );

        return;
      }

      if (
        isAlreadyBilled(
          selectedPrescription
        )
      ) {
        alert(
          "This prescription has already been billed."
        );

        return;
      }

      try {
        setGenerating(true);

        const response =
          await pharmacyapi.post(
            `pharmacist/issued-prescriptions/${selectedPrescription.id}/bill/`,
            {
              payment_method:
                paymentMethod,
            }
          );

        console.log(
          "Generated bill:",
          response.data
        );

        const bill =
          response.data.bill;

        setGeneratedBill(
          bill
        );

        alert(
          "Bill generated successfully!"
        );

        // Refresh data

        await loadBills();

        await loadIssuedPrescriptions();

        // Clear selected prescription

        setSelectedPrescription(
          null
        );

        setSearchPatient("");

      } catch (error) {
        console.error(
          "Bill generation error:",
          error.response?.data || error
        );

        const message =
          error.response?.data?.detail ||
          "Unable to generate bill.";

        alert(
          message
        );

      } finally {
        setGenerating(false);
      }
    };

  // ==========================================
  // PRINT BILL
  // ==========================================

  const handlePrintBill = () => {
    window.print();
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="billing">
        <h1>
          Pharmacy Billing
        </h1>

        <p>
          Loading billing data...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="billing">
        <h1>
          Pharmacy Billing
        </h1>

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>

        <button
          onClick={loadPageData}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="billing">

      <h1>
        Pharmacy Billing
      </h1>

      <p>
        Generate bills for medicines
        issued to patients.
      </p>

      {/* ==================================== */}
      {/* SEARCH */}
      {/* ==================================== */}

      <div className="billing-search">

        <input
          type="text"
          placeholder="Search patient by name or patient ID..."
          value={searchPatient}
          onChange={(e) =>
            setSearchPatient(
              e.target.value
            )
          }
        />

      </div>

      {/* ==================================== */}
      {/* PATIENT RESULTS */}
      {/* ==================================== */}

      {searchPatient.trim() && (

        <div className="billing-patient-results">

          <h3>
            Select Patient
          </h3>

          {filteredPrescriptions.length >
          0 ? (

            filteredPrescriptions.map(
              (
                issuedPrescription
              ) => (

                <div
                  key={
                    issuedPrescription.id
                  }
                  className="billing-patient-item"
                  onClick={() =>
                    setSelectedPrescription(
                      issuedPrescription
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <strong>
                    {
                      issuedPrescription.patient_name
                    }
                  </strong>

                  <p>
                    Patient ID:{" "}
                    {
                      issuedPrescription.patient_id
                    }
                  </p>

                  <p>
                    Appointment:{" "}
                    {
                      issuedPrescription.appointment_id
                    }
                  </p>

                  <p>
                    Issued On:{" "}
                    {
                      issuedPrescription.issued_at
                        ? new Date(
                            issuedPrescription.issued_at
                          ).toLocaleString()
                        : "-"
                    }
                  </p>

                </div>

              )
            )

          ) : (

            <p>
              No unbilled issued prescriptions found.
            </p>

          )}

        </div>

      )}

      {/* ==================================== */}
      {/* BILL DETAILS */}
      {/* ==================================== */}

      {selectedPrescription && (

        <div className="bill-details">

          <h2>
            Bill Details
          </h2>

          {/* PATIENT DETAILS */}

          <div className="bill-patient-info">

            <p>
              <strong>
                Patient Name:
              </strong>{" "}

              {
                selectedPrescription.patient_name
              }
            </p>

            <p>
              <strong>
                Patient ID:
              </strong>{" "}

              {
                selectedPrescription.patient_id
              }
            </p>

            <p>
              <strong>
                Appointment ID:
              </strong>{" "}

              {
                selectedPrescription.appointment_id
              }
            </p>

          </div>

          {/* MEDICINES TABLE */}

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Price / Unit
                </th>

                <th>
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              {selectedPrescription
                .medicines
                ?.map(
                  (medicine) => {

                    const quantity =
                      Number(
                        medicine.issued_quantity
                      ) || 0;

                    const price =
                      Number(
                        medicine.price_at_issue
                      ) || 0;

                    const total =
                      quantity * price;

                    return (

                      <tr
                        key={
                          medicine.id
                        }
                      >

                        <td>
                          {
                            medicine.medicine_name
                          }
                        </td>

                        <td>
                          {quantity}
                        </td>

                        <td>
                          ₹ {price.toFixed(2)}
                        </td>

                        <td>
                          ₹ {total.toFixed(2)}
                        </td>

                      </tr>

                    );
                  }
                )}

            </tbody>

          </table>

          {/* TOTAL */}

          <div className="bill-total">

            <h2>
              Total Amount: ₹{" "}
              {
                calculateTotal()
                  .toFixed(2)
              }
            </h2>

          </div>

          {/* PAYMENT METHOD */}

          <div className="payment-section">

            <label>
              Payment Method:
            </label>

            <select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            >

              <option>
                Cash
              </option>

              <option>
                Card
              </option>

              <option>
                UPI
              </option>

            </select>

          </div>

          {/* GENERATE BUTTON */}

          <button
            className="generate-bill-button"
            onClick={
              handleGenerateBill
            }
            disabled={
              generating
            }
          >

            {generating
              ? "Generating Bill..."
              : "Generate Bill"}

          </button>

        </div>

      )}

      {/* ==================================== */}
      {/* GENERATED BILL RECEIPT */}
      {/* ==================================== */}

      {generatedBill && (

        <div className="bill-receipt">

          <h2>
            Clinic Management System
          </h2>

          <h3>
            Pharmacy Bill Receipt
          </h3>

          <hr />

          <p>
            <strong>
              Bill Number:
            </strong>{" "}

            {
              generatedBill.bill_number
            }
          </p>

          <p>
            <strong>
              Date:
            </strong>{" "}

            {
              generatedBill.bill_date
                ? new Date(
                    generatedBill.bill_date
                  ).toLocaleString()
                : "-"
            }
          </p>

          <p>
            <strong>
              Patient:
            </strong>{" "}

            {
              generatedBill.patient_name ||
              "-"
            }
          </p>

          <p>
            <strong>
              Patient ID:
            </strong>{" "}

            {
              generatedBill.patient_id ||
              "-"
            }
          </p>

          <p>
            <strong>
              Total Amount:
            </strong>{" "}

            ₹ {
              Number(
                generatedBill.total_amount
              ).toFixed(2)
            }
          </p>

          <p>
            <strong>
              Payment Method:
            </strong>{" "}

            {
              generatedBill.payment_method
            }
          </p>

          <button
            className="print-bill-button"
            onClick={
              handlePrintBill
            }
          >
            Print Bill
          </button>

        </div>

      )}

    </div>
  );
}

export default PharmacyBilling;

