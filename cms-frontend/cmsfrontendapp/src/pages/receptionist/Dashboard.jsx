import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../components/receptionist/Sidebar'
import Header from '../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function Dashboard() {

  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])

  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  const [errorMessage, setErrorMessage] = useState('')

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken')

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const getToday = () => {
    const today = new Date()

    const year = today.getFullYear()

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      today.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
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

  const fetchPatients = async () => {

    setLoadingPatients(true)

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/patients/`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load patients.'
        )
      }

      setPatients(
        Array.isArray(data)
          ? data
          : data.results || []
      )

    } catch (error) {

      console.error(
        'PATIENT DASHBOARD ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load patients.'
      )

    } finally {

      setLoadingPatients(false)
    }
  }

  const fetchAppointments = async () => {

    setLoadingAppointments(true)

    try {

      const today = getToday()

      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/?date=${today}`,
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

      setAppointments(
        appointmentList
          .filter(
            (appointment) =>
              appointment.status !== 'CANCELLED'
          )
          .sort(
            (a, b) =>
              a.appointment_time.localeCompare(
                b.appointment_time
              )
          )
      )

    } catch (error) {

      console.error(
        'APPOINTMENT DASHBOARD ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load appointments.'
      )

    } finally {

      setLoadingAppointments(false)
    }
  }

  useEffect(() => {

    fetchPatients()
    fetchAppointments()

  }, [])

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="dashboard-content">

          <div className="welcome-section">

            <h2>
              Welcome back, Receptionist 👋
            </h2>

            <p>
              Here's what's happening at the clinic today.
            </p>

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

          <div className="row g-4 mb-4">

            {/* Total Patients */}

            <div className="col-md-4">

              <div className="dashboard-card">

                <div>

                  <p>
                    Total Patients
                  </p>

                  <h3>
                    {loadingPatients
                      ? '...'
                      : patients.length}
                  </h3>

                </div>

                <div className="card-icon">
                  👤
                </div>

              </div>

            </div>

            {/* Today's Appointments */}

            <div className="col-md-4">

              <div className="dashboard-card">

                <div>

                  <p>
                    Today's Appointments
                  </p>

                  <h3>
                    {loadingAppointments
                      ? '...'
                      : appointments.length}
                  </h3>

                </div>

                <div className="card-icon">
                  📅
                </div>

              </div>

            </div>

            {/* Pending Bills */}

            <div className="col-md-4">

              <div className="dashboard-card">

                <div>

                  <p>
                    Pending Bills
                  </p>

                  <h3>
                    —
                  </h3>

                </div>

                <div className="card-icon">
                  💰
                </div>

              </div>

            </div>

          </div>

          {/* Today's Appointments */}

          <div className="appointments-section">

            <div className="section-header">

              <h4>
                Today's Appointments
              </h4>

              <button
                className="view-all-btn"
                onClick={() =>
                  navigate('/appointments/list')
                }
              >
                View All
              </button>

            </div>

            {loadingAppointments ? (

              <p>
                Loading today's appointments...
              </p>

            ) : appointments.length === 0 ? (

              <p>
                No appointments scheduled for today.
              </p>

            ) : (

              <div className="table-responsive">

                <table className="appointment-table">

                  <thead>

                    <tr>

                      <th>
                        Time
                      </th>

                      <th>
                        Token
                      </th>

                      <th>
                        Patient
                      </th>

                      <th>
                        Doctor
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {appointments.map(
                      (appointment) => (

                        <tr
                          key={
                            appointment.id
                          }
                        >

                          <td>
                            {formatTime(
                              appointment.appointment_time
                            )}
                          </td>

                          <td>
                            {appointment.token_number}
                          </td>

                          <td>
                            {appointment.patient_name}
                          </td>

                          <td>
                            {appointment.doctor_name}
                          </td>

                          <td>

                            <span className="status-badge">
                              {appointment.status}
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

        </main>

      </div>

    </div>
  )
}

export default Dashboard