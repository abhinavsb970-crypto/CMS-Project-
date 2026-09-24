import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function PatientDetails() {

  const navigate = useNavigate()
  const { patientId } = useParams()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const getHeaders = () => {

    const token = localStorage.getItem(
      'accessToken'
    )

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const getPatientName = (patientData) => {

    return (
      `${patientData.first_name || ''} ${
        patientData.last_name || ''
      }`
    ).trim()
  }

  const fetchPatient = async () => {

    setLoading(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patientId}/`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to load patient record.'
        )
      }

      setPatient(data)

    } catch (error) {

      console.error(
        'PATIENT DETAILS ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load patient record.'
      )

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {

    if (patientId) {
      fetchPatient()
    }

  }, [patientId])

  if (loading) {

    return (
      <div className="app-layout">

        <Sidebar />

        <div className="main-section">

          <Header />

          <main className="dashboard-content">

            <p>
              Loading patient record...
            </p>

          </main>

        </div>

      </div>
    )
  }

  if (errorMessage || !patient) {

    return (
      <div className="app-layout">

        <Sidebar />

        <div className="main-section">

          <Header />

          <main className="dashboard-content">

            <h2>
              Patient Record Not Found
            </h2>

            <p>
              {errorMessage ||
                'The requested patient record could not be found.'}
            </p>

            <button
              className="back-btn"
              onClick={() =>
                navigate('/patients')
              }
            >
              ← Back to Patients
            </button>

          </main>

        </div>

      </div>
    )
  }

  const patientName =
    getPatientName(patient)

  const isActive =
    patient.is_active !== false

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="dashboard-content">

          {/* Page Header */}

          <div className="page-header">

            <div>

              <h2>
                Patient Details
              </h2>

              <p>
                View complete patient information.
              </p>

            </div>

            <button
              className="back-btn"
              onClick={() =>
                navigate('/patients')
              }
            >
              ← Back to Patients
            </button>

          </div>

          {/* Patient Details */}

          <div className="patient-details-card">

            <div className="patient-profile-header">

              <div className="patient-avatar">
                {patient.first_name
                  ? patient.first_name.charAt(0).toUpperCase()
                  : 'P'}
              </div>

              <div>

                <h3>
                  {patientName}
                </h3>

                <p>
                  Patient ID:{' '}
                  <strong>
                    {patient.patient_id}
                  </strong>
                </p>

                <span
                  className={
                    isActive
                      ? 'status-active'
                      : 'status-inactive'
                  }
                >
                  {isActive
                    ? 'Active'
                    : 'Inactive'}
                </span>

              </div>

            </div>

            {/* Personal Information */}

            <div className="details-section">

              <h4>
                Personal Information
              </h4>

              <div className="details-grid">

                <div className="detail-item">

                  <span>
                    First Name
                  </span>

                  <strong>
                    {patient.first_name}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Last Name
                  </span>

                  <strong>
                    {patient.last_name}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Date of Birth
                  </span>

                  <strong>
                    {patient.date_of_birth}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Gender
                  </span>

                  <strong>
                    {patient.gender}
                  </strong>

                </div>

              </div>

            </div>

            {/* Contact Information */}

            <div className="details-section">

              <h4>
                Contact Information
              </h4>

              <div className="details-grid">

                <div className="detail-item">

                  <span>
                    Phone Number
                  </span>

                  <strong>
                    {patient.phone}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Email
                  </span>

                  <strong>
                    {patient.email ||
                      'Not provided'}
                  </strong>

                </div>

                <div className="detail-item detail-full">

                  <span>
                    Address
                  </span>

                  <strong>
                    {patient.address}
                  </strong>

                </div>

              </div>

            </div>

            {/* Emergency Contact */}

            <div className="details-section">

              <h4>
                Emergency Contact
              </h4>

              <div className="details-grid">

                <div className="detail-item">

                  <span>
                    Contact Name
                  </span>

                  <strong>
                    {patient.emergency_name ||
                      'Not provided'}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Contact Phone
                  </span>

                  <strong>
                    {patient.emergency_phone ||
                      'Not provided'}
                  </strong>

                </div>

              </div>

            </div>

            {/* Additional Information */}

            <div className="details-section">

              <h4>
                Additional Information
              </h4>

              <div className="details-grid">

                <div className="detail-item">

                  <span>
                    Blood Group
                  </span>

                  <strong>
                    {patient.blood_group ||
                      'Not provided'}
                  </strong>

                </div>

                <div className="detail-item">

                  <span>
                    Insurance / Membership
                  </span>

                  <strong>
                    {patient.insurance ||
                      'Not provided'}
                  </strong>

                </div>

              </div>

            </div>

            {/* Actions */}

            <div className="patient-actions">

              <button
                className="primary-btn"
                onClick={() =>
                  navigate(
                    `/patients/${patient.patient_id}/edit`
                  )
                }
              >
                Edit Patient
              </button>

            </div>

          </div>

          {/* Appointment History */}

          <div className="appointments-section">

            <div className="section-header">

              <h4>
                Appointment History
              </h4>

            </div>

            <div className="table-responsive">

              <table className="appointment-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr>

                    <td colSpan="4">
                      Appointment history API
                      integration can be added
                      from the existing appointment
                      endpoint.
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}

export default PatientDetails