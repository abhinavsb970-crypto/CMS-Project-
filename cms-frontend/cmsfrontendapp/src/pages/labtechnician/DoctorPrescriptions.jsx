import { useEffect, useState } from "react";

function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allotting, setAllotting] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDoctorPrescriptions();
  }, []);

  const fetchDoctorPrescriptions = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/lab-technician/doctor-prescriptions/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
        setError(
          data.detail || "Unable to load doctor lab prescriptions."
        );
        setLoading(false);
        return;
      }

      setPrescriptions(data);
    } catch (err) {
      console.error("DOCTOR PRESCRIPTIONS ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  const handleAllotTest = async (prescriptionId) => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setAllotting(prescriptionId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/doctor-prescriptions/${prescriptionId}/allot/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login session has expired. Please login again.");
        setAllotting(null);
        return;
      }

      if (!response.ok) {
        setError(
          data.detail || "Unable to allot this laboratory test."
        );
        setAllotting(null);
        return;
      }

      setSuccess(
        `Test allotted successfully. Request ID: ${data.lab_request.request_id}`
      );

      // Remove the allotted prescription from this page.
      setPrescriptions((currentPrescriptions) =>
        currentPrescriptions.filter(
          (prescription) => prescription.id !== prescriptionId
        )
      );
    } catch (err) {
      console.error("ALLOT TEST ERROR:", err);
      setError("Unable to connect to the server.");
    }

    setAllotting(null);
  };

  return (
    <section className="doctor-prescriptions-page">

      {/* Page Header */}
      <div className="doctor-prescriptions-header">
        <h2>Doctor Lab Prescriptions</h2>

        <p>
          View laboratory tests prescribed by doctors and allot them for
          processing
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Main Card */}
      <div className="card shadow-sm">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">

          <div>
            <h5 className="mb-1">
              Doctor Prescriptions
            </h5>

            <p className="text-muted mb-0">
              Laboratory tests waiting to be allotted
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={fetchDoctorPrescriptions}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <p className="mt-3 mb-0">
              Loading doctor prescriptions...
            </p>
          </div>
        ) : prescriptions.length === 0 ? (
          /* Empty */
          <div className="text-center py-5">

            <h5>
              No doctor lab prescriptions found.
            </h5>

            <p className="text-muted mb-0">
              There are currently no laboratory prescriptions waiting
              for allotment.
            </p>

          </div>
        ) : (
          /* Table */
          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th>Prescription</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Laboratory Test</th>
                  <th>Category</th>
                  <th>Sample</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {prescriptions.map((prescription) => (
                  <tr key={prescription.id}>

                    {/* Prescription */}
                    <td>
                      <strong>
                        #{prescription.id}
                      </strong>

                      <div className="small text-muted">
                        Consultation #{prescription.consultation_id}
                      </div>
                    </td>

                    {/* Patient */}
                    <td>
                      <strong>
                        {prescription.patient_id}
                      </strong>

                      <div>
                        {prescription.patient_name || "-"}
                      </div>

                      <div className="small text-muted">
                        Appointment #{prescription.appointment_id}
                      </div>
                    </td>

                    {/* Doctor */}
                    <td>
                      {prescription.doctor_name || "-"}
                    </td>

                    {/* Laboratory Test */}
                    <td>
                      <strong>
                        {prescription.test_name}
                      </strong>

                      <div className="small text-muted">
                        {prescription.test_code}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      {prescription.category || "-"}
                    </td>

                    {/* Sample */}
                    <td>
                      {prescription.sample_type || "-"}
                    </td>

                    {/* Price */}
                    <td>
                      ₹{prescription.price}
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          handleAllotTest(prescription.id)
                        }
                        disabled={allotting === prescription.id}
                      >
                        {allotting === prescription.id
                          ? "Allotting..."
                          : "Allot Test"}
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

export default DoctorPrescriptions;