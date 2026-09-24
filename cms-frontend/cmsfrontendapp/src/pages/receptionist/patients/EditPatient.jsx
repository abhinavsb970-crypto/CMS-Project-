import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function EditPatient() {

  const navigate = useNavigate()
  const { patientId } = useParams()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_name: '',
    emergency_phone: '',
    blood_group: '',
    insurance: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

      setFormData({
        first_name:
          data.first_name || '',

        last_name:
          data.last_name || '',

        date_of_birth:
          data.date_of_birth || '',

        gender:
          data.gender || '',

        phone:
          data.phone || '',

        email:
          data.email || '',

        address:
          data.address || '',

        emergency_name:
          data.emergency_name || '',

        emergency_phone:
          data.emergency_phone || '',

        blood_group:
          data.blood_group || '',

        insurance:
          data.insurance || '',
      })

    } catch (error) {

      console.error(
        'EDIT PATIENT LOAD ERROR:',
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

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {

    event.preventDefault()

    setSaving(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patientId}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to update patient.'
        )
      }

      navigate(
        `/patients/${patientId}`
      )

    } catch (error) {

      console.error(
        'PATIENT UPDATE ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to update patient.'
      )

    } finally {

      setSaving(false)
    }
  }

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

  if (errorMessage && !formData.first_name) {

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
              {errorMessage}
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

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="dashboard-content">

          <div className="page-header">

            <div>

              <h2>
                Update Patient
              </h2>

              <p>
                Update the patient's information below.
              </p>

            </div>

            <button
              className="back-btn"
              onClick={() =>
                navigate(
                  `/patients/${patientId}`
                )
              }
            >
              ← Back
            </button>

          </div>

          {errorMessage && (

            <div
              style={{
                padding: '15px',
                marginBottom: '20px',
                background: '#fee2e2',
                borderRadius: '8px',
                color: '#991b1b',
                fontWeight: '600',
              }}
            >
              {errorMessage}
            </div>

          )}

          <form
            className="patient-form"
            onSubmit={handleSubmit}
          >

            {/* Personal Information */}

            <div className="form-section">

              <h4>
                Personal Information
              </h4>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label">
                    First Name *
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Last Name *
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Gender *
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* Contact Information */}

            <div className="form-section">

              <h4>
                Contact Information
              </h4>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />

                </div>

                <div className="col-12">

                  <label className="form-label">
                    Address *
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    required
                  />

                </div>

              </div>

            </div>

            {/* Emergency Contact */}

            <div className="form-section">

              <h4>
                Emergency Contact
              </h4>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label">
                    Contact Name
                  </label>

                  <input
                    type="text"
                    name="emergency_name"
                    value={formData.emergency_name}
                    onChange={handleChange}
                    className="form-control"
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Contact Phone
                  </label>

                  <input
                    type="tel"
                    name="emergency_phone"
                    value={formData.emergency_phone}
                    onChange={handleChange}
                    className="form-control"
                  />

                </div>

              </div>

            </div>

            {/* Additional Information */}

            <div className="form-section">

              <h4>
                Additional Information
              </h4>

              <div className="row g-3">

                <div className="col-md-6">

                  <label className="form-label">
                    Blood Group
                  </label>

                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="form-select"
                  >

                    <option value="">
                      Select Blood Group
                    </option>

                    <option value="A+">
                      A+
                    </option>

                    <option value="A-">
                      A-
                    </option>

                    <option value="B+">
                      B+
                    </option>

                    <option value="B-">
                      B-
                    </option>

                    <option value="AB+">
                      AB+
                    </option>

                    <option value="AB-">
                      AB-
                    </option>

                    <option value="O+">
                      O+
                    </option>

                    <option value="O-">
                      O-
                    </option>

                  </select>

                </div>

                <div className="col-md-6">

                  <label className="form-label">
                    Insurance / Membership
                  </label>

                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    className="form-control"
                  />

                </div>

              </div>

            </div>

            {/* Buttons */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  navigate(
                    `/patients/${patientId}`
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

            </div>

          </form>

        </main>

      </div>

    </div>
  )
}

export default EditPatient