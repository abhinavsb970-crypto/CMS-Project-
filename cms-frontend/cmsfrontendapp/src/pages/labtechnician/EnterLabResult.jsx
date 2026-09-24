import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import "./EnterLabResult.css";


function EnterLabResult() {

  const { requestId } = useParams();

  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  const [result, setResult] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };


  // =====================================================
  // FETCH TEST DETAILS
  // =====================================================

  useEffect(() => {
    fetchTestDetails();
  }, [requestId]);


  const fetchTestDetails = async () => {

    const token = getToken();

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Unable to load lab test details."
        );

        setLoading(false);
        return;
      }

      setTest(data);

      // -------------------------------------------------
      // LOAD EXISTING RESULT
      // -------------------------------------------------

      if (data.lab_result !== null && data.lab_result !== undefined) {
        setResult(data.lab_result);
      } else {
        setResult("");
      }

      if (
        data.result_remarks !== null &&
        data.result_remarks !== undefined
      ) {
        setRemarks(data.result_remarks);
      } else {
        setRemarks("");
      }

    } catch (err) {

      console.error(
        "FETCH TEST ERROR:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    }

    setLoading(false);
  };


  // =====================================================
  // SAVE NEW RESULT
  // =====================================================

  const handleSaveResult = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!result.trim()) {

      setError(
        "Please enter the lab result."
      );

      return;
    }

    const token = getToken();

    if (!token) {

      setError(
        "You are not logged in."
      );

      return;
    }

    setSaving(true);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/result/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            request: test.id,
            result: result.trim(),
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        if (typeof data === "object") {

          const firstError =
            Object.values(data)[0];

          if (Array.isArray(firstError)) {

            setError(firstError[0]);

          } else {

            setError(
              data.detail ||
              "Unable to save the lab result."
            );
          }

        } else {

          setError(
            "Unable to save the lab result."
          );
        }

        setSaving(false);
        return;
      }

      setSuccess(
        "Lab result saved successfully."
      );

      setEditing(false);

      setTest((previousTest) => ({
        ...previousTest,
        status: "IN_PROGRESS",
        lab_result: data.result,
        result_remarks: data.remarks,
      }));

    } catch (err) {

      console.error(
        "SAVE RESULT ERROR:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    }

    setSaving(false);
  };


  // =====================================================
  // UPDATE EXISTING RESULT
  // =====================================================

  const handleUpdateResult = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    if (!result.trim()) {

      setError(
        "Please enter the lab result."
      );

      return;
    }

    const token = getToken();

    if (!token) {

      setError(
        "You are not logged in."
      );

      return;
    }

    setSaving(true);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/result/`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            result: result.trim(),
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        if (typeof data === "object") {

          const firstError =
            Object.values(data)[0];

          if (Array.isArray(firstError)) {

            setError(firstError[0]);

          } else {

            setError(
              data.detail ||
              "Unable to update the lab result."
            );
          }

        } else {

          setError(
            "Unable to update the lab result."
          );
        }

        setSaving(false);
        return;
      }

      setSuccess(
        "Lab result updated successfully."
      );

      setEditing(false);

      setTest((previousTest) => ({
        ...previousTest,
        lab_result: data.result,
        result_remarks: data.remarks,
      }));

    } catch (err) {

      console.error(
        "UPDATE RESULT ERROR:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    }

    setSaving(false);
  };


  // =====================================================
  // START EDITING
  // =====================================================

  const handleEditResult = () => {

    setError("");
    setSuccess("");

    setEditing(true);
  };


  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancelEdit = () => {

    setResult(test.lab_result || "");
    setRemarks(test.result_remarks || "");

    setEditing(false);

    setError("");
    setSuccess("");
  };


  // =====================================================
  // COMPLETE TEST
  // =====================================================

  const handleCompleteTest = async () => {

    setError("");
    setSuccess("");

    const token = getToken();

    if (!token) {

      setError(
        "You are not logged in."
      );

      return;
    }

    setCompleting(true);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/lab-technician/tests/${requestId}/complete/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Unable to complete the lab test."
        );

        setCompleting(false);
        return;
      }

      setSuccess(
        "Lab test completed successfully."
      );

      setTest((previousTest) => ({
        ...previousTest,
        status: "COMPLETED",
      }));

      setEditing(false);

      setTimeout(() => {

        navigate(
          "/lab-technician/completed-tests"
        );

      }, 1000);

    } catch (err) {

      console.error(
        "COMPLETE TEST ERROR:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    }

    setCompleting(false);
  };


  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {

    navigate(
      `/lab-technician/tests/${requestId}`
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <section className="enter-result-page">

        <div className="enter-result-loading">
          Loading lab test...
        </div>

      </section>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error && !test) {

    return (
      <section className="enter-result-page">

        <div className="enter-result-error">
          {error}
        </div>

        <button
          className="enter-result-back-button"
          onClick={handleBack}
        >
          Back
        </button>

      </section>
    );
  }


  if (!test) {

    return (
      <section className="enter-result-page">

        <div className="enter-result-error">
          Lab test not found.
        </div>

        <button
          className="enter-result-back-button"
          onClick={handleBack}
        >
          Back
        </button>

      </section>
    );
  }


  const hasResult =
    test.lab_result !== null &&
    test.lab_result !== undefined &&
    test.lab_result !== "";


  const isCompleted =
    test.status === "COMPLETED";


  const isCancelled =
    test.status === "CANCELLED";


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section className="enter-result-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="enter-result-header">

        <div>

          <h2>Enter Lab Result</h2>

          <p>
            Enter and manage the laboratory test result
          </p>

        </div>

        <button
          className="enter-result-back-button"
          onClick={handleBack}
        >
          Back to Test Details
        </button>

      </div>


      {/* =================================================
          TEST INFORMATION
          ================================================= */}

      <div className="enter-result-info-card">

        <div className="enter-result-info-header">

          <div>

            <h2>Test Information</h2>

            <p>
              Details of the laboratory test request
            </p>

          </div>

          <span
            className={`enter-result-status ${
              test.status
                .toLowerCase()
                .replace("_", "-")
            }`}
          >
            {test.status.replace("_", " ")}
          </span>

        </div>


        <div className="enter-result-info-grid">

          <div className="enter-result-info-item">

            <span>Request ID</span>

            <strong className="request-value">
              {test.request_id}
            </strong>

          </div>


          <div className="enter-result-info-item">

            <span>Patient ID</span>

            <strong>
              {test.patient_id}
            </strong>

          </div>


          <div className="enter-result-info-item">

            <span>Test Code</span>

            <strong>
              {test.test_code}
            </strong>

          </div>


          <div className="enter-result-info-item">

            <span>Test Name</span>

            <strong>
              {test.test_name}
            </strong>

          </div>


          <div className="enter-result-info-item">

            <span>Category</span>

            <strong>
              {test.category || "-"}
            </strong>

          </div>


          <div className="enter-result-info-item">

            <span>Sample Type</span>

            <strong>
              {test.sample_type || "-"}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          LABORATORY RESULT
          ================================================= */}

      <div className="enter-result-form-card">

        <div className="enter-result-form-header">

          <div>

            <h2>Laboratory Result</h2>

            <p>
              {hasResult
                ? "Laboratory result recorded for this test."
                : "Enter the findings obtained from the laboratory test."
              }
            </p>

          </div>

        </div>


        {error && (
          <div className="enter-result-error">
            {error}
          </div>
        )}


        {success && (
          <div className="enter-result-success">
            {success}
          </div>
        )}


        {/* =================================================
            EXISTING RESULT - READ ONLY
            ================================================= */}

        {hasResult && !editing && (

          <div className="existing-result-container">

            <div className="enter-result-form-group">

              <label>
                Result
              </label>

              <textarea
                value={result}
                rows="7"
                readOnly
              />

            </div>


            <div className="enter-result-form-group">

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                rows="4"
                readOnly
              />

            </div>


            {!isCompleted && !isCancelled && (

              <div className="enter-result-actions">

                <button
                  type="button"
                  className="enter-result-edit-button"
                  onClick={handleEditResult}
                  disabled={saving || completing}
                >
                  Edit Result
                </button>

              </div>

            )}

            {isCompleted && (

              <div className="enter-result-locked-message">

                This laboratory result is locked because
                the test has been completed.

              </div>

            )}

          </div>

        )}


        {/* =================================================
            NEW RESULT FORM
            ================================================= */}

        {!hasResult && !isCompleted && !isCancelled && (

          <form onSubmit={handleSaveResult}>

            <div className="enter-result-form-group">

              <label>
                Result <span>*</span>
              </label>

              <textarea
                value={result}
                onChange={(event) =>
                  setResult(event.target.value)
                }
                placeholder="Enter the laboratory test result..."
                rows="7"
              />

              <small>
                Enter the measured values, findings,
                or observations from the laboratory test.
              </small>

            </div>


            <div className="enter-result-form-group">

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                placeholder="Enter any additional remarks..."
                rows="4"
              />

            </div>


            <div className="enter-result-actions">

              <button
                type="button"
                className="enter-result-cancel-button"
                onClick={handleBack}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="enter-result-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Result"
                }
              </button>

            </div>

          </form>

        )}


        {/* =================================================
            EDIT EXISTING RESULT
            ================================================= */}

        {hasResult && editing && (

          <form onSubmit={handleUpdateResult}>

            <div className="enter-result-form-group">

              <label>
                Result <span>*</span>
              </label>

              <textarea
                value={result}
                onChange={(event) =>
                  setResult(event.target.value)
                }
                placeholder="Enter the laboratory test result..."
                rows="7"
              />

            </div>


            <div className="enter-result-form-group">

              <label>
                Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                placeholder="Enter any additional remarks..."
                rows="4"
              />

            </div>


            <div className="enter-result-actions">

              <button
                type="button"
                className="enter-result-cancel-button"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="enter-result-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"
                }
              </button>

            </div>

          </form>

        )}

      </div>


      {/* =================================================
          COMPLETE TEST
          ================================================= */}

      {test.status === "IN_PROGRESS" && (

        <div className="complete-test-card">

          <div>

            <h2>
              Complete Laboratory Test
            </h2>

            <p>
              After verifying the result, mark this
              test as completed.
            </p>

          </div>


          <button
            className="complete-test-button"
            onClick={handleCompleteTest}
            disabled={completing || editing}
          >
            {completing
              ? "Completing..."
              : "Complete Test"
            }
          </button>

        </div>

      )}

    </section>
  );
}


export default EnterLabResult;