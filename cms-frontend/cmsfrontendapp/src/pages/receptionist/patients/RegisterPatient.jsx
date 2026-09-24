import { useState } from 'react'
import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000'

function RegisterPatient() {

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const fromAppointment =
    searchParams.get('from') === 'appointment'

  const fromConsultation =
    searchParams.get('from') === 'consultation'

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
    insurance: ''
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const getHeaders = () => {

    const token = localStorage.getItem(
      'accessToken'
    )

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }))

    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event) => {

    event.preventDefault()

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        if (typeof data === 'object') {

          const messages = Object.entries(data)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors)
                ? errors.join(', ')
                : String(errors)

              return `${field}: ${errorText}`
            })
            .join(' | ')

          throw new Error(
            messages ||
            'Unable to register patient.'
          )
        }

        throw new Error(
          'Unable to register patient.'
        )
      }

      setSuccessMessage(
        `Patient registered successfully. Patient ID: ${data.patient_id}`
      )

      if (fromAppointment) {

        setTimeout(() => {
          navigate(
            '/appointments',
            {
              state: {
                newPatient: data
              }
            }
          )
        }, 1000)

        return
      }

      if (fromConsultation) {

        setTimeout(() => {
          navigate(
            '/consultation',
            {
              state: {
                newPatient: data
              }
            }
          )
        }, 1000)

        return
      }

      setTimeout(() => {
        navigate('/patients')
      }, 1000)

    } catch (error) {

      console.error(
        'PATIENT REGISTRATION ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to register patient.'
      )

    } finally {

      setLoading(false)
    }
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
                Register New Patient
              </h2>

              <p>
                Enter the patient's information to create
                a new record.
              </p>

            </div>

          </div>

          {/* Error */}

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

          {/* Success */}

          {successMessage && (

            <div
              style={{
                padding: '15px',
                marginBottom: '20px',
                background: '#dcfce7',
                borderRadius: '8px',
                color: '#166534',
                fontWeight: '600',
              }}
            >
              {successMessage}
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
                    placeholder="Enter first name"
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
                    placeholder="Enter last name"
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
                    placeholder="Enter phone number"
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
                    placeholder="Enter email address"
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
                    placeholder="Enter complete address"
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
                    placeholder="Enter emergency contact name"
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
                    placeholder="Enter emergency contact phone"
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
                    placeholder="Optional"
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
                  navigate('/patients')
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? 'Registering...'
                  : 'Register Patient'}
              </button>

            </div>

          </form>

        </main>

      </div>

    </div>
  )
}

export default RegisterPatient