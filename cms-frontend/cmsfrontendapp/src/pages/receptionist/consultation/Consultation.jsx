import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate
} from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function Consultation() {

  const navigate = useNavigate()
  const location = useLocation()

  const [patientType, setPatientType] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])

  const [department, setDepartment] = useState('')
  const [doctor, setDoctor] = useState('')

  const [appointmentTime, setAppointmentTime] = useState('')
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [loadingPatients, setLoadingPatients] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)


  const getToken = () => {
    return localStorage.getItem('accessToken')
  }


  const getHeaders = () => {

    const token = getToken()

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }


  // IMPORTANT:
  // Uses local browser date instead of UTC date.
  // This prevents "Consultation can only be booked for today"
  // errors caused by toISOString().
  const getTodayDate = () => {

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


  const formatTodayDate = () => {

    const today = new Date()

    return today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }


  const formatTime = (time) => {

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
    setErrorMessage('')

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
          data.detail ||
          'Unable to load patients.'
        )
      }

      setPatients(
        Array.isArray(data)
          ? data
          : data.results || []
      )

    } catch (error) {

      console.error(
        'PATIENT LOAD ERROR:',
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


  const fetchDepartments = async () => {

    setLoadingDepartments(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/admin/departments/`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to load departments.'
        )
      }

      const departmentList =
        Array.isArray(data)
          ? data
          : data.results || []

      setDepartments(
        departmentList.filter(
          (item) => item.is_active !== false
        )
      )

    } catch (error) {

      console.error(
        'DEPARTMENT LOAD ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to load departments.'
      )

    } finally {

      setLoadingDepartments(false)
    }
  }


  const fetchDoctors = async (departmentId) => {

    if (!departmentId) {

      setDoctors([])
      return
    }

    setLoadingDoctors(true)
    setErrorMessage('')

    try {

      const response = await fetch(
        `${API_BASE}/api/admin/doctors/?department=${departmentId}`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to load doctors.'
        )
      }

      setDoctors(
        Array.isArray(data)
          ? data
          : data.results || []
      )

    } catch (error) {

      console.error(
        'DOCTOR LOAD ERROR:',
        error
      )

      setDoctors([])

      setErrorMessage(
        error.message ||
        'Unable to load doctors.'
      )

    } finally {

      setLoadingDoctors(false)
    }
  }


  const fetchAvailableSlots = async (doctorId) => {

    if (!doctorId) {

      setAvailableTimeSlots([])
      return
    }

    setLoadingSlots(true)
    setAppointmentTime('')
    setErrorMessage('')

    try {

      const today = getTodayDate()

      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/available-slots/?doctor=${doctorId}&date=${today}`,
        {
          headers: getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to load available time slots.'
        )
      }

      const slots = Array.isArray(data.slots)
        ? data.slots
        : []

      setAvailableTimeSlots(
        slots.map((slot) => ({
          value: slot,
          label: formatTime(slot),
        }))
      )

    } catch (error) {

      console.error(
        'SLOT LOAD ERROR:',
        error
      )

      setAvailableTimeSlots([])

      setErrorMessage(
        error.message ||
        'Unable to load available time slots.'
      )

    } finally {

      setLoadingSlots(false)
    }
  }


  useEffect(() => {

    fetchPatients()
    fetchDepartments()

  }, [])


  // Get the newly registered patient from RegisterPatient
  useEffect(() => {

    const newPatient =
      location.state?.newPatient

    if (!newPatient) {
      return
    }

    setPatientType('existing')
    setSelectedPatient(newPatient)

    const name = (
      `${newPatient.first_name || ''} ${
        newPatient.last_name || ''
      }`
    ).trim()

    setSearchTerm(name)

    setSuccessMessage(
      `Patient ${newPatient.patient_id} registered successfully. You can now book the consultation.`
    )

    navigate('/consultation', {
      replace: true,
      state: null,
    })

  }, [location.state, navigate])


  useEffect(() => {

    if (department) {

      fetchDoctors(department)

    } else {

      setDoctors([])
    }

    setDoctor('')
    setAppointmentTime('')
    setAvailableTimeSlots([])

  }, [department])


  useEffect(() => {

    if (doctor) {

      fetchAvailableSlots(doctor)

    } else {

      setAvailableTimeSlots([])
      setAppointmentTime('')
    }

  }, [doctor])


  const filteredPatients = patients.filter(
    (patient) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim()

      if (!search) {
        return true
      }

      const fullName = (
        `${patient.first_name || ''} ${
          patient.last_name || ''
        }`
      ).toLowerCase()

      const phone = String(
        patient.phone || ''
      )

      const patientId = String(
        patient.patient_id || ''
      ).toLowerCase()

      return (
        fullName.includes(search) ||
        phone.includes(search) ||
        patientId.includes(search)
      )
    }
  )


  const handlePatientTypeChange = (type) => {

    setPatientType(type)

    setSelectedPatient(null)
    setSearchTerm('')

    setDepartment('')
    setDoctor('')
    setAppointmentTime('')
    setAvailableTimeSlots([])

    setSuccessMessage('')
    setErrorMessage('')
  }


  const handlePatientSelect = (patient) => {

    setSelectedPatient(patient)

    const name = (
      `${patient.first_name || ''} ${
        patient.last_name || ''
      }`
    ).trim()

    setSearchTerm(name)

    setSuccessMessage('')
    setErrorMessage('')
  }


  const handleDepartmentChange = (event) => {

    const departmentId =
      event.target.value

    setDepartment(departmentId)

    setDoctor('')
    setAppointmentTime('')
    setAvailableTimeSlots([])

    setSuccessMessage('')
    setErrorMessage('')
  }


  const handleDoctorChange = (event) => {

    const doctorId =
      event.target.value

    setDoctor(doctorId)

    setAppointmentTime('')

    setSuccessMessage('')
    setErrorMessage('')
  }


  const handleBookConsultation = async () => {

    setSuccessMessage('')
    setErrorMessage('')


    if (!patientType) {

      setErrorMessage(
        'Please select New Patient or Existing Patient.'
      )

      return
    }


    if (patientType === 'new') {

      setErrorMessage(
        'Please register the new patient before booking the consultation.'
      )

      return
    }


    if (!selectedPatient) {

      setErrorMessage(
        'Please select an existing patient.'
      )

      return
    }


    if (!department) {

      setErrorMessage(
        'Please select a department.'
      )

      return
    }


    if (!doctor) {

      setErrorMessage(
        'Please select a doctor.'
      )

      return
    }


    if (!appointmentTime) {

      setErrorMessage(
        'Please select an appointment time.'
      )

      return
    }


    setBooking(true)

    try {

      // Uses the browser's local date
      const today = getTodayDate()


      const response = await fetch(
        `${API_BASE}/api/receptionist/appointments/`,
        {
          method: 'POST',

          headers: getHeaders(),

          body: JSON.stringify({
            patient:
              selectedPatient.patient_id,

            doctor:
              Number(doctor),

            appointment_date:
              today,

            appointment_time:
              appointmentTime,

            appointment_type:
              'CONSULTATION',
          }),
        }
      )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to book consultation.'
        )
      }


      setSuccessMessage(
        `Consultation booked successfully for today at ${formatTime(appointmentTime)}. Token Number: ${data.token_number}`
      )


      setAppointmentTime('')


      // Refresh slots after booking so the selected slot disappears
      await fetchAvailableSlots(doctor)

    } catch (error) {

      console.error(
        'CONSULTATION BOOKING ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to book consultation.'
      )

    } finally {

      setBooking(false)
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
                Consultation
              </h2>

              <p>
                Book a consultation for the current day.
              </p>

            </div>

          </div>


          <div className="patient-form">


            {/* Patient Type */}

            <div className="form-section">

              <h4>
                Patient Type
              </h4>


              <div className="row">

                <div className="col-md-6">

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      handlePatientTypeChange(
                        'new'
                      )
                    }
                  >
                    New Patient
                  </button>

                </div>


                <div className="col-md-6">

                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() =>
                      handlePatientTypeChange(
                        'existing'
                      )
                    }
                  >
                    Existing Patient
                  </button>

                </div>

              </div>

            </div>


            {/* New Patient */}

            {patientType === 'new' && (

              <div className="form-section">

                <h4>
                  New Patient
                </h4>

                <p>
                  Please register the patient before
                  booking the consultation.
                </p>


                <button
                  type="button"
                  className="primary-btn"
                  onClick={() =>
                    navigate(
                      '/patients/register?from=consultation'
                    )
                  }
                >
                  Register Patient
                </button>

              </div>

            )}


            {/* Existing Patient */}

            {patientType === 'existing' && (

              <div className="form-section">

                <h4>
                  Search Existing Patient
                </h4>


                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    loadingPatients
                      ? 'Loading patients...'
                      : 'Search by patient name, phone, or patient ID...'
                  }
                  value={searchTerm}
                  onChange={(event) => {

                    setSearchTerm(
                      event.target.value
                    )

                    setSelectedPatient(null)

                  }}
                  disabled={
                    loadingPatients
                  }
                />


                {searchTerm &&
                  !selectedPatient && (

                    <div
                      style={{
                        marginTop: '15px'
                      }}
                    >

                      {filteredPatients.length === 0 ? (

                        <p>
                          No matching patients found.
                        </p>

                      ) : (

                        filteredPatients.map(
                          (patient) => {

                            const name = (
                              `${patient.first_name || ''} ${
                                patient.last_name || ''
                              }`
                            ).trim()


                            return (

                              <button
                                key={patient.id}
                                type="button"
                                className="action-btn"
                                onClick={() =>
                                  handlePatientSelect(
                                    patient
                                  )
                                }
                              >
                                {name}
                                {' - '}
                                {patient.phone}
                                {' - '}
                                {patient.patient_id}
                              </button>

                            )
                          }
                        )

                      )}

                    </div>

                  )}


                {selectedPatient && (

                  <div
                    style={{
                      marginTop: '20px'
                    }}
                  >

                    <strong>
                      Selected Patient:
                    </strong>

                    <p>

                      {selectedPatient.first_name}
                      {' '}
                      {selectedPatient.last_name}

                      {' '}

                      (
                      {selectedPatient.patient_id}
                      )

                    </p>

                  </div>

                )}

              </div>

            )}


            {/* Consultation Details */}

            {patientType === 'existing' &&
              selectedPatient && (

                <div className="form-section">

                  <h4>
                    Consultation Details
                  </h4>


                  <div className="row">

                    {/* Date */}

                    <div className="col-md-6">

                      <label className="form-label">
                        Consultation Date
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          formatTodayDate()
                        }
                        readOnly
                      />

                    </div>


                    {/* Department */}

                    <div className="col-md-6">

                      <label className="form-label">
                        Department
                      </label>

                      <select
                        className="form-select"
                        value={department}
                        onChange={
                          handleDepartmentChange
                        }
                        disabled={
                          loadingDepartments
                        }
                      >

                        <option value="">
                          {loadingDepartments
                            ? 'Loading Departments...'
                            : 'Select Department'}
                        </option>


                        {departments.map(
                          (item) => (

                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.name}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>


                  {/* Doctor */}

                  <div
                    style={{
                      marginTop: '20px'
                    }}
                  >

                    <label className="form-label">
                      Doctor
                    </label>

                    <select
                      className="form-select"
                      value={doctor}
                      onChange={
                        handleDoctorChange
                      }
                      disabled={
                        !department ||
                        loadingDoctors
                      }
                    >

                      <option value="">
                        {loadingDoctors
                          ? 'Loading Doctors...'
                          : 'Select Doctor'}
                      </option>


                      {doctors.map(
                        (item) => (

                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* Time */}

                  {doctor && (

                    <div
                      style={{
                        marginTop: '20px'
                      }}
                    >

                      <label className="form-label">
                        Available Time
                      </label>


                      {loadingSlots ? (

                        <p>
                          Loading available slots...
                        </p>

                      ) : availableTimeSlots.length === 0 ? (

                        <p>
                          No available slots for today.
                        </p>

                      ) : (

                        <div>

                          {availableTimeSlots.map(
                            (slot) => (

                              <button
                                key={slot.value}
                                type="button"
                                className="action-btn"
                                onClick={() =>
                                  setAppointmentTime(
                                    slot.value
                                  )
                                }
                                style={{
                                  marginBottom: '8px',
                                  background:
                                    appointmentTime ===
                                    slot.value
                                      ? '#374151'
                                      : 'white',
                                  color:
                                    appointmentTime ===
                                    slot.value
                                      ? 'white'
                                      : '#111827'
                                }}
                              >
                                {slot.label}
                              </button>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )}


            {/* Error */}

            {errorMessage && (

              <div
                style={{
                  padding: '15px',
                  marginBottom: '20px',
                  background: '#fee2e2',
                  borderRadius: '8px',
                  fontWeight: '600'
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
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                {successMessage}
              </div>

            )}


            {/* Buttons */}

            {patientType === 'existing' &&
              selectedPatient && (

                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      navigate('/')
                    }
                    disabled={booking}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="primary-btn"
                    onClick={
                      handleBookConsultation
                    }
                    disabled={booking}
                  >
                    {booking
                      ? 'Booking...'
                      : 'Book Consultation'}
                  </button>

                </div>

              )}

          </div>


          <button
            className="back-btn"
            onClick={() =>
              navigate('/')
            }
          >
            ← Back
          </button>

        </main>

      </div>

    </div>
  )
}

export default Consultation