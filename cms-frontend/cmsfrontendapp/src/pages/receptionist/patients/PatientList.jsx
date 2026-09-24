import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function PatientList() {

  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [disablingPatient, setDisablingPatient] = useState(null)


  const getHeaders = () => {

    const token =
      localStorage.getItem('accessToken')

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }


  const calculateAge = (dateOfBirth) => {

    if (!dateOfBirth) {
      return '-'
    }

    const birthDate =
      new Date(dateOfBirth)

    const today = new Date()

    let age =
      today.getFullYear() -
      birthDate.getFullYear()

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth()

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {
      age--
    }

    return age
  }


  const getPatientName = (patient) => {

    return (
      `${patient.first_name || ''} ${
        patient.last_name || ''
      }`
    ).trim()
  }


  const fetchPatients = async () => {

    setLoading(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/`,
        {
          headers: getHeaders(),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to load patients.'
        )
      }

      const patientList =
        Array.isArray(data)
          ? data
          : data.results || []

      setPatients(patientList)

    } catch (error) {

      console.error(
        'PATIENT LIST ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load patients.'
      )

    } finally {

      setLoading(false)
    }
  }


  useEffect(() => {

    fetchPatients()

  }, [])


  const handleDisablePatient = async (patient) => {

    const patientName =
      getPatientName(patient)

    const confirmed =
      window.confirm(
        `Are you sure you want to disable ${patientName} (${patient.patient_id})?`
      )

    if (!confirmed) {
      return
    }

    setDisablingPatient(
      patient.patient_id
    )

    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/${patient.patient_id}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            is_active: false,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to disable patient.'
        )
      }

      // Update the patient directly in the current list
      setPatients((currentPatients) =>
        currentPatients.map((item) =>
          item.patient_id ===
          patient.patient_id
            ? {
                ...item,
                is_active: false,
              }
            : item
        )
      )

    } catch (error) {

      console.error(
        'DISABLE PATIENT ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to disable patient.'
      )

    } finally {

      setDisablingPatient(null)
    }
  }


  const clearSearch = () => {
    setSearchTerm('')
  }


  const filteredPatients =
    patients.filter((patient) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim()

      if (!search) {
        return true
      }

      const name =
        getPatientName(patient)
          .toLowerCase()

      const phone =
        String(
          patient.phone || ''
        )

      const patientId =
        String(
          patient.patient_id || ''
        ).toLowerCase()

      return (
        name.includes(search) ||
        phone.includes(search) ||
        patientId.includes(search)
      )
    })


  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="dashboard-content">

          <div className="page-header">

            <div>

              <h2>
                Patient Management
              </h2>

              <p>
                View and manage registered patients.
              </p>

            </div>


            <button
              className="primary-btn"
              onClick={() =>
                navigate(
                  '/patients/register'
                )
              }
            >
              + Register Patient
            </button>

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
                fontWeight: '600'
              }}
            >
              {errorMessage}
            </div>

          )}


          {/* Search */}

          <div className="patient-toolbar">

            <input
              type="text"
              placeholder={
                loading
                  ? 'Loading patients...'
                  : 'Search by patient ID, name or phone number...'
              }
              className="search-input"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              disabled={loading}
            />


            {searchTerm && (

              <button
                type="button"
                className="cancel-btn clear-filter-btn"
                onClick={clearSearch}
              >
                Clear
              </button>

            )}

          </div>


          {/* Patient Table */}

          <div className="patients-section">

            <div className="table-responsive">

              <table className="patient-table">

                <thead>

                  <tr>

                    <th>
                      Patient ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Age
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Address
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="no-patients"
                      >
                        Loading patients...
                      </td>

                    </tr>

                  ) : filteredPatients.length > 0 ? (

                    filteredPatients.map(
                      (patient) => {

                        const patientName =
                          getPatientName(
                            patient
                          )

                        const isActive =
                          patient.is_active !== false

                        const isDisabling =
                          disablingPatient ===
                          patient.patient_id

                        return (

                          <tr
                            key={patient.id}
                          >

                            <td>

                              <strong>
                                {
                                  patient.patient_id
                                }
                              </strong>

                            </td>


                            <td>
                              {patientName}
                            </td>


                            <td>
                              {calculateAge(
                                patient.date_of_birth
                              )}
                            </td>


                            <td>
                              {patient.gender}
                            </td>


                            <td>
                              {patient.phone}
                            </td>


                            <td>
                              {patient.address}
                            </td>


                            <td>

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

                            </td>


                            <td>

                              <button
                                type="button"
                                className="action-btn"
                                onClick={() =>
                                  navigate(
                                    `/patients/${patient.patient_id}`
                                  )
                                }
                              >
                                View
                              </button>


                              <button
                                type="button"
                                className="action-btn"
                                onClick={() =>
                                  navigate(
                                    `/patients/${patient.patient_id}/edit`
                                  )
                                }
                              >
                                Edit
                              </button>


                              {isActive && (

                                <button
                                  type="button"
                                  className="action-btn"
                                  onClick={() =>
                                    handleDisablePatient(
                                      patient
                                    )
                                  }
                                  disabled={isDisabling}
                                >
                                  {isDisabling
                                    ? 'Disabling...'
                                    : 'Disable'}
                                </button>

                              )}

                            </td>

                          </tr>

                        )
                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="8"
                        className="no-patients"
                      >
                        No patients found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>


          <button
            className="back-btn"
            onClick={() =>
              navigate('/receptionist')
            }
          >
            ← Back to Dashboard
          </button>

        </main>

      </div>

    </div>
  )
}

export default PatientList