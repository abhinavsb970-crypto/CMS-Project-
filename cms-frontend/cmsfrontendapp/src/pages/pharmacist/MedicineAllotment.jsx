import { useEffect, useState } from "react";
import pharmacyapi from "../../api/pharmacyapi";

function MedicineAllotment() {
  // ==========================================
  // STATE
  // ==========================================

  const [prescriptions, setPrescriptions] = useState([]);

  const [medicines, setMedicines] = useState([]);

  const [searchPatient, setSearchPatient] = useState("");

  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);

  const [loading, setLoading] = useState(true);

  const [medicineLoading, setMedicineLoading] = useState(false);

  const [issuing, setIssuing] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD DOCTOR PRESCRIPTIONS
  // ==========================================

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await pharmacyapi.get(
        "pharmacist/doctor-prescriptions/"
      );

      setPrescriptions(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error(
        "Error loading doctor prescriptions:",
        error
      );

      setError(
        "Unable to load prescriptions. Please check the Django backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD MEDICINE INVENTORY
  // ==========================================

  const loadMedicines = async () => {
    try {
      const response = await pharmacyapi.get(
        "pharmacist/medicines/"
      );

      setMedicines(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error(
        "Error loading inventory:",
        error
      );

      setMedicines([]);
    }
  };

  // ==========================================
  // LOAD DATA WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      try {
        const [
          prescriptionsResponse,
          medicinesResponse,
        ] = await Promise.all([
          pharmacyapi.get(
            "pharmacist/doctor-prescriptions/"
          ),
          pharmacyapi.get(
            "pharmacist/medicines/"
          ),
        ]);

        if (!cancelled) {
          setPrescriptions(
            Array.isArray(prescriptionsResponse.data)
              ? prescriptionsResponse.data
              : []
          );

          setMedicines(
            Array.isArray(medicinesResponse.data)
              ? medicinesResponse.data
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Error loading page data:",
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load prescriptions. Please check the Django backend."
          );

          setPrescriptions([]);
          setMedicines([]);
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // SEARCH PRESCRIPTIONS
  // ==========================================

  const filteredPrescriptions =
    prescriptions.filter((prescription) => {
      const patientName =
        prescription.patient_name || "";

      const patientId =
        prescription.patient_id || "";

      const search =
        searchPatient
          .trim()
          .toLowerCase();

      return (
        patientName
          .toLowerCase()
          .includes(search) ||
        patientId
          .toLowerCase()
          .includes(search)
      );
    });

  // ==========================================
  // SELECT PRESCRIPTION
  // ==========================================

  const handleSelectPrescription = (prescription) => {
    try {
      setSelectedPrescription(
        prescription
      );

      setPrescriptionMedicines([]);

      setMedicineLoading(true);

      /*
       * Doctor prescription API already returns
       * the medicines inside the prescription.
       *
       * No separate API call is required.
       */
      setPrescriptionMedicines(
        Array.isArray(prescription.medicines)
          ? prescription.medicines
          : []
      );
    } catch (error) {
      console.error(
        "Error loading prescription medicines:",
        error
      );

      alert(
        "Unable to load prescription medicines."
      );

      setPrescriptionMedicines([]);
    } finally {
      setMedicineLoading(false);
    }
  };

  // ==========================================
  // FIND INVENTORY MEDICINE
  // ==========================================

  const getInventoryMedicine = (
    prescribedMedicine
  ) => {
    /*
     * Preferred matching:
     *
     * Doctor medicine_id
     *       ↓
     * Admin Medicine ID
     *       ↓
     * Pharmacist master_medicine
     *
     * This avoids depending only on medicine names.
     */

    const masterMedicineId =
      Number(
        prescribedMedicine.medicine_id
      );

    const medicineByMasterId =
      medicines.find(
        (medicine) =>
          medicine.master_medicine &&
          Number(
            medicine.master_medicine
          ) === masterMedicineId
      );

    if (medicineByMasterId) {
      return medicineByMasterId;
    }

    /*
     * Fallback to medicine name.
     * This helps if an old inventory record
     * has not been linked to master_medicine yet.
     */

    const medicineName =
      prescribedMedicine.medicine_name || "";

    return medicines.find(
      (medicine) =>
        medicine.name
          ?.toLowerCase()
          .trim() ===
        medicineName
          ?.toLowerCase()
          .trim()
    );
  };

  // ==========================================
  // CHECK STOCK AVAILABILITY
  // ==========================================

  const hasInsufficientStock =
    prescriptionMedicines.some(
      (prescribedMedicine) => {
        const inventoryMedicine =
          getInventoryMedicine(
            prescribedMedicine
          );

        if (!inventoryMedicine) {
          return true;
        }

        return (
          Number(
            inventoryMedicine.stock
          ) <
          Number(
            prescribedMedicine.quantity
          )
        );
      }
    );

  // ==========================================
  // ISSUE MEDICINES
  // ==========================================

  const handleIssueMedicines =
    async () => {
      if (!selectedPrescription) {
        alert(
          "Please select a prescription."
        );

        return;
      }

      if (
        prescriptionMedicines.length === 0
      ) {
        alert(
          "No medicines found in this prescription."
        );

        return;
      }

      // ========================================
      // CHECK INVENTORY BEFORE ISSUING
      // ========================================

      for (
        const prescribedMedicine of
          prescriptionMedicines
      ) {
        const inventoryMedicine =
          getInventoryMedicine(
            prescribedMedicine
          );

        if (!inventoryMedicine) {
          alert(
            `${prescribedMedicine.medicine_name} is not available in inventory.`
          );

          return;
        }

        if (
          Number(
            inventoryMedicine.stock
          ) <
          Number(
            prescribedMedicine.quantity
          )
        ) {
          alert(
            `Insufficient stock for ${prescribedMedicine.medicine_name}. Available: ${inventoryMedicine.stock}, Required: ${prescribedMedicine.quantity}`
          );

          return;
        }
      }

      // ========================================
      // ISSUE THROUGH DJANGO BACKEND
      // ========================================

      try {
        setIssuing(true);

        const response =
          await pharmacyapi.post(
            `pharmacist/doctor-prescriptions/${selectedPrescription.consultation_id}/issue/`
          );

        console.log(
          "Doctor prescription issue response:",
          response.data
        );

        alert(
          "Medicines issued successfully!"
        );

        // ======================================
        // REFRESH BACKEND DATA
        // ======================================

        await Promise.all([
          loadMedicines(),
          loadPrescriptions(),
        ]);

        // ======================================
        // CLEAR SELECTION
        // ======================================

        setSelectedPrescription(
          null
        );

        setPrescriptionMedicines(
          []
        );

        setSearchPatient("");

      } catch (error) {
        console.error(
          "Error issuing medicines:",
          error.response?.data || error
        );

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to issue medicines. Please check the backend.";

        alert(message);

      } finally {
        setIssuing(false);
      }
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="allotment">
        <h1>
          Allot Medicine
        </h1>

        <p>
          Loading prescriptions...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="allotment">
        <h1>
          Allot Medicine
        </h1>

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>

        <button
          onClick={() => {
            loadPrescriptions();
            loadMedicines();
          }}
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
    <div className="allotment">

      <h1>
        Allot Medicine
      </h1>

      <p>
        Search for a patient and issue
        medicines according to the
        prescription.
      </p>

      {/* ==================================== */}
      {/* SEARCH */}
      {/* ==================================== */}

      <div className="search-section">

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
      {/* PRESCRIPTION RESULTS */}
      {/* ==================================== */}

      {searchPatient.trim() && (
        <div className="patient-results">

          <h3>
            Select Prescription
          </h3>

          {filteredPrescriptions.length >
          0 ? (

            filteredPrescriptions.map(
              (prescription) => (

                <div
                  className="patient-item"
                  key={
                    prescription.consultation_id
                  }
                  onClick={() =>
                    handleSelectPrescription(
                      prescription
                    )
                  }
                  style={{
                    cursor: "pointer",
                  }}
                >

                  <strong>
                    {
                      prescription.patient_name
                    }
                  </strong>

                  <p>
                    Patient ID:{" "}
                    {
                      prescription.patient_id
                    }
                  </p>

                  <p>
                    Appointment:{" "}
                    {
                      prescription.appointment_id
                    }
                  </p>

                  <p>
                    Doctor:{" "}
                    {
                      prescription.doctor_name
                    }
                  </p>

                </div>

              )
            )

          ) : (

            <p>
              No unissued prescription found.
            </p>

          )}

        </div>
      )}

      {/* ==================================== */}
      {/* SELECTED PRESCRIPTION */}
      {/* ==================================== */}

      {selectedPrescription && (

        <div className="prescription-section">

          <h2>
            Prescription Details
          </h2>

          {/* PATIENT DETAILS */}

          <div className="patient-details">

            <p>
              <strong>
                Patient:
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

            <p>
              <strong>
                Consultation ID:
              </strong>{" "}

              {
                selectedPrescription.consultation_id
              }
            </p>

            <p>
              <strong>
                Doctor:
              </strong>{" "}

              {
                selectedPrescription.doctor_name
              }
            </p>

            <p>
              <strong>
                Date:
              </strong>{" "}

              {
                selectedPrescription.appointment_date
              }
            </p>

          </div>

          {/* ================================= */}
          {/* MEDICINE LOADING */}
          {/* ================================= */}

          {medicineLoading ? (

            <p>
              Loading prescribed medicines...
            </p>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Frequency
                  </th>

                  <th>
                    Duration
                  </th>

                  <th>
                    Instructions
                  </th>

                  <th>
                    Route
                  </th>

                  <th>
                    Prescribed Quantity
                  </th>

                  <th>
                    Available Stock
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {prescriptionMedicines
                  .length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                    >
                      No medicines found.
                    </td>

                  </tr>

                ) : (

                  prescriptionMedicines.map(
                    (
                      prescribedMedicine
                    ) => {

                      const inventoryMedicine =
                        getInventoryMedicine(
                          prescribedMedicine
                        );

                      const hasEnoughStock =
                        inventoryMedicine &&
                        Number(
                          inventoryMedicine.stock
                        ) >=
                        Number(
                          prescribedMedicine.quantity
                        );

                      return (

                        <tr
                          key={
                            prescribedMedicine.id
                          }
                        >

                          <td>
                            {
                              prescribedMedicine.medicine_name
                            }
                          </td>

                          <td>
                            {
                              prescribedMedicine.frequency
                            }
                          </td>

                          <td>
                            {
                              prescribedMedicine.duration
                            } days
                          </td>

                          <td>
                            {
                              prescribedMedicine.instructions
                            }
                          </td>

                          <td>
                            {
                              prescribedMedicine.route
                            }
                          </td>

                          <td>
                            {
                              prescribedMedicine.quantity
                            }
                          </td>

                          <td>

                            {
                              inventoryMedicine
                                ? inventoryMedicine.stock
                                : "Not Available"
                            }

                          </td>

                          <td>

                            {!inventoryMedicine
                              ? "Not Available"
                              : hasEnoughStock
                              ? "Available"
                              : "Insufficient Stock"}

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          )}

          {/* ================================= */}
          {/* ISSUE BUTTON */}
          {/* ================================= */}

          {!medicineLoading &&
            prescriptionMedicines.length >
              0 && (

            <button
              className="issue-button"
              onClick={
                handleIssueMedicines
              }
              disabled={
                issuing ||
                hasInsufficientStock
              }
            >

              {issuing
                ? "Issuing Medicines..."
                : hasInsufficientStock
                ? "Insufficient Stock"
                : "Issue Medicines"}

            </button>

          )}

        </div>

      )}

    </div>
  );
}

export default MedicineAllotment;