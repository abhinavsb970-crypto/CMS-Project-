import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar from '../../../components/receptionist/Sidebar'
import Header from '../../../components/receptionist/Header'

const API_BASE = 'http://127.0.0.1:8000'

function Billing() {

  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState('')

  const [generatedBill, setGeneratedBill] = useState(null)

  const [paymentMethod, setPaymentMethod] = useState('CASH')

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [loadingAppointments, setLoadingAppointments] =
    useState(false)

  const [generatingBill, setGeneratingBill] =
    useState(false)

  const [processingPayment, setProcessingPayment] =
    useState(false)


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


  const formatTime = (time) => {

    if (!time) {
      return ''
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


  const fetchAppointments = async () => {

    setLoadingAppointments(true)
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

      const appointmentList =
        Array.isArray(data)
          ? data
          : data.results || []

      // Cancelled appointments should not be billed.
      setAppointments(
        appointmentList.filter(
          (item) => item.status !== 'CANCELLED'
        )
      )

    } catch (error) {

      console.error(
        'APPOINTMENT LOAD ERROR:',
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

    fetchAppointments()

  }, [])


  const appointment = appointments.find(
    (item) =>
      String(item.id) ===
      String(selectedAppointment)
  )


  const handleGenerateBill = async () => {

    setSuccessMessage('')
    setErrorMessage('')

    if (!selectedAppointment) {

      setErrorMessage(
        'Please select an appointment.'
      )

      return
    }

    setGeneratingBill(true)

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/bills/`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            appointment:
              Number(selectedAppointment),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to generate bill.'
        )
      }

      setGeneratedBill(data)

      setPaymentMethod(
        data.payment_method || 'CASH'
      )

      setSuccessMessage(
        `Bill generated successfully for ${data.patient_name || appointment?.patient_name || 'the patient'}.`
      )

    } catch (error) {

      console.error(
        'BILL GENERATION ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to generate bill.'
      )

    } finally {

      setGeneratingBill(false)
    }
  }


  const handleProcessPayment = async () => {

    if (!generatedBill) {
      return
    }

    setSuccessMessage('')
    setErrorMessage('')
    setProcessingPayment(true)

    try {

      const response = await fetch(
        `${API_BASE}/api/receptionist/bills/${generatedBill.id}/`,
        {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            payment_status: 'PAID',
            payment_method: paymentMethod,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Unable to process payment.'
        )
      }

      setGeneratedBill(data)

      setSuccessMessage(
        'Payment processed successfully.'
      )

    } catch (error) {

      console.error(
        'PAYMENT ERROR:',
        error
      )

      setErrorMessage(
        error.message ||
        'Unable to process payment.'
      )

    } finally {

      setProcessingPayment(false)
    }
  }


  const handleAppointmentChange = (event) => {

    setSelectedAppointment(
      event.target.value
    )

    setGeneratedBill(null)
    setSuccessMessage('')
    setErrorMessage('')
  }


  const patientName = generatedBill?.patient_name ||
    appointment?.patient_name ||
    ''

  const patientId = generatedBill?.patient_id ||
    appointment?.patient_id ||
    ''

  const doctorName = generatedBill?.doctor_name ||
    appointment?.doctor_name ||
    ''

  const departmentName =
    generatedBill?.department_name ||
    appointment?.department_name ||
    ''

  const appointmentDate =
    generatedBill?.appointment_date ||
    appointment?.appointment_date ||
    ''

  const appointmentTime =
    generatedBill?.appointment_time ||
    appointment?.appointment_time ||
    ''

  const consultationFee =
    generatedBill?.consultation_fee ?? 0

  const registrationFee =
    generatedBill?.registration_fee ?? 0

  const totalAmount =
    generatedBill?.total_amount ?? 0

  const billId =
    generatedBill?.id || ''


  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-section">

        <Header />

        <main className="dashboard-content">

          <div className="page-header">

            <div>

              <h2>
                Consultation Billing
              </h2>

              <p>
                Generate and process consultation bills.
              </p>

            </div>

          </div>


          <div className="patient-form">

            {/* Appointment Selection */}

            <div className="form-section">

              <h4>
                Select Appointment
              </h4>

              <div className="mb-3">

                <label className="form-label">
                  Appointment
                </label>

                <select
                  className="form-select"
                  value={selectedAppointment}
                  onChange={handleAppointmentChange}
                  disabled={loadingAppointments}
                >

                  <option value="">
                    {loadingAppointments
                      ? 'Loading appointments...'
                      : 'Select an appointment'}
                  </option>

                  {appointments.map(
                    (item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.id}
                        {' - '}
                        {item.patient_name}
                        {' - '}
                        {item.appointment_date}
                        {' - '}
                        {formatTime(
                          item.appointment_time
                        )}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* Selected Appointment */}

            {appointment && (

              <div className="form-section">

                <h4>
                  Appointment Details
                </h4>

                <div className="details-grid">

                  <div className="detail-item">

                    <span>
                      Appointment ID
                    </span>

                    <strong>
                      {appointment.id}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Token Number
                    </span>

                    <strong>
                      {appointment.token_number}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Patient
                    </span>

                    <strong>
                      {appointment.patient_name}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Patient ID
                    </span>

                    <strong>
                      {appointment.patient_id}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Doctor
                    </span>

                    <strong>
                      {appointment.doctor_name}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Department
                    </span>

                    <strong>
                      {appointment.department_name}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Appointment Date
                    </span>

                    <strong>
                      {appointment.appointment_date}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Appointment Time
                    </span>

                    <strong>
                      {formatTime(
                        appointment.appointment_time
                      )}
                    </strong>

                  </div>


                  <div className="detail-item">

                    <span>
                      Status
                    </span>

                    <strong>
                      {appointment.status}
                    </strong>

                  </div>

                </div>

              </div>

            )}


            {/* Generate Bill */}

            {appointment && !generatedBill && (

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/')}
                  disabled={generatingBill}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleGenerateBill}
                  disabled={generatingBill}
                >
                  {generatingBill
                    ? 'Generating Bill...'
                    : 'Generate Bill'}
                </button>

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

          </div>


          {/* Generated Bill */}

          {generatedBill && (

            <div className="generated-bill">

              <div className="bill-header">

                <h2>
                  Clinic System
                </h2>

                <p>
                  Consultation Bill
                </p>

              </div>


              <div className="bill-info-grid">

                <div>

                  <span>
                    Bill ID
                  </span>

                  <strong>
                    {billId}
                  </strong>

                </div>


                <div>

                  <span>
                    Appointment ID
                  </span>

                  <strong>
                    {generatedBill.appointment}
                  </strong>

                </div>


                <div>

                  <span>
                    Bill Date
                  </span>

                  <strong>
                    {generatedBill.created_at
                      ? new Date(
                          generatedBill.created_at
                        ).toLocaleDateString('en-IN')
                      : appointmentDate}
                  </strong>

                </div>

              </div>


              <div className="bill-section">

                <h4>
                  Patient Details
                </h4>

                <div className="bill-details-grid">

                  <div>

                    <span>
                      Patient ID
                    </span>

                    <strong>
                      {patientId}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Patient Name
                    </span>

                    <strong>
                      {patientName}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Doctor
                    </span>

                    <strong>
                      {doctorName}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Department
                    </span>

                    <strong>
                      {departmentName}
                    </strong>

                  </div>

                </div>

              </div>


              <div className="bill-section">

                <h4>
                  Appointment
                </h4>

                <div className="bill-details-grid">

                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {appointmentDate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Time
                    </span>

                    <strong>
                      {formatTime(
                        appointmentTime
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              <div className="bill-section">

                <h4>
                  Charges
                </h4>


                <div className="bill-charge-row">

                  <span>
                    Consultation Fee
                  </span>

                  <strong>
                    ₹{consultationFee}
                  </strong>

                </div>


                <div className="bill-charge-row">

                  <span>
                    Registration Fee
                  </span>

                  <strong>
                    ₹{registrationFee}
                  </strong>

                </div>


                <div className="bill-total-row">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹{totalAmount}
                  </strong>

                </div>

              </div>


              {/* Payment */}

              <div className="bill-payment">

                <span>
                  Payment Status
                </span>

                <strong>
                  {generatedBill.payment_status}
                </strong>

              </div>


              {generatedBill.payment_status !== 'PAID' && (

                <div
                  style={{
                    marginTop: '20px'
                  }}
                >

                  <label className="form-label">
                    Payment Method
                  </label>

                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={processingPayment}
                  >

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="CARD">
                      Card
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>

              )}


              <div className="bill-actions">

                {generatedBill.payment_status !== 'PAID' && (

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleProcessPayment}
                    disabled={processingPayment}
                  >
                    {processingPayment
                      ? 'Processing...'
                      : 'Process Payment'}
                  </button>

                )}


                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => window.print()}
                >
                  Print Bill
                </button>

              </div>

            </div>

          )}


          <button
            className="back-btn"
            onClick={() => navigate('/')}
          >
            ← Back
          </button>

        </main>

      </div>

    </div>
  )
}

export default Billing