import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function AppointmentList() {

  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])

  const [searchDate, setSearchDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const getHeaders = () => {

    const token = localStorage.getItem('accessToken')

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const formatTime = (time) => {

    if (!time) {
      return '-'
    }

    const [hours, minutes] = time.split(':')

    const date = new Date()

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    )

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatStatus = (status) => {

    if (!status) {
      return '-'
    }

    return status.charAt(0) +
      status.slice(1).toLowerCase()
  }

  const fetchAppointments = async () => {

    setLoading(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to load appointments.'
        )
      }

      const appointmentList = Array.isArray(data)
        ? data
        : data.results || []

      setAppointments(appointmentList)

    } catch (error) {

      console.error(
        'APPOINTMENT LIST ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load appointments.'
      )

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments =
    appointments.filter((appointment) => {

      const appointmentDate =
        appointment.appointment_date

      if (
        searchDate &&
        appointmentDate !== searchDate
      ) {
        return false
      }

      if (
        fromDate &&
        appointmentDate < fromDate
      ) {
        return false
      }

      if (
        toDate &&
        appointmentDate > toDate
      ) {
        return false
      }

      return true
    })

  const clearFilters = () => {

    setSearchDate('')
    setFromDate('')
    setToDate('')
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
                Appointment Listing
              </h2>

              <p>
                View and manage scheduled appointments.
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

          {/* Filters */}

          <div className="appointment-filters">

            <div className="filter-item">

              <label className="form-label">
                Select Date
              </label>

              <input
                type="date"
                className="form-control"
                value={searchDate}
                onChange={(event) =>
                  setSearchDate(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="filter-item">

              <label className="form-label">
                From Date
              </label>

              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="filter-item">

              <label className="form-label">
                To Date
              </label>

              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(event) =>
                  setToDate(
                    event.target.value
                  )
                }
              />

            </div>

            <button
              type="button"
              className="cancel-btn clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

          {/* Appointment Table */}

          <div className="appointments-section">

            <div className="section-header">

              <h4>
                All Appointments
              </h4>

              <span>
                {filteredAppointments.length}
                {' '}
                appointment(s)
              </span>

            </div>

            {loading ? (

              <p>
                Loading appointments...
              </p>

            ) : (

              <div className="table-responsive">

                <table className="appointment-table">

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Patient
                      </th>

                      <th>
                        Doctor
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Time
                      </th>

                      <th>
                        Token
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredAppointments.length > 0 ? (

                      filteredAppointments.map(
                        (appointment) => (

                          <tr
                            key={appointment.id}
                          >

                            <td>
                              <strong>
                                #{appointment.id}
                              </strong>
                            </td>

                            <td>

                              <strong>
                                {
                                  appointment.patient_name
                                }
                              </strong>

                              <br />

                              <small>
                                {
                                  appointment.patient
                                }
                              </small>

                            </td>

                            <td>
                              {
                                appointment.doctor_name
                              }
                            </td>

                            <td>
                              {
                                appointment.department_name
                              }
                            </td>

                            <td>
                              {
                                appointment.appointment_date
                              }
                            </td>

                            <td>
                              {formatTime(
                                appointment.appointment_time
                              )}
                            </td>

                            <td>
                              {
                                appointment.token_number
                              }
                            </td>

                            <td>
                              {
                                appointment.appointment_type
                              }
                            </td>

                            <td>

                              <span
                                className="status-badge"
                              >
                                {formatStatus(
                                  appointment.status
                                )}
                              </span>

                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="9"
                          className="no-patients"
                        >
                          No appointments found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

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

export default AppointmentList