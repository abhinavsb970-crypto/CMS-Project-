import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";


// ============================================================
// LOGIN
// ============================================================

import Login from "./pages/Login";


// ============================================================
// DOCTOR
// ============================================================

import DoctorDashboard
    from "./pages/doctor/DoctorDashboard";

import TodayAppointments
    from "./pages/doctor/TodayAppointments";

import UpcomingAppointments
    from "./pages/doctor/UpcomingAppointments";

import StartConsultation
    from "./pages/doctor/StartConsultation";

import ConsultationHistory
    from "./pages/doctor/ConsultationHistory";

import PatientFile
    from "./pages/doctor/PatientFile";

import MedicalHistory
    from "./pages/doctor/MedicalHistory";

import Consultation
    from "./pages/doctor/Consultation";


// ============================================================
// ADMIN
// ============================================================

import AdminLayout
    from "./pages/admin/AdminLayout";

import AdminDashboard
    from "./pages/admin/AdminDashboard";

import Staff
    from "./pages/admin/Staff";

import Departments
    from "./pages/admin/Departments";

import Medicines
    from "./pages/admin/Medicines";

import LabTest
    from "./pages/admin/LabTest";

import AdminRoute
    from "./components/admin/AdminRoute";


// ============================================================
// LAB TECHNICIAN
// ============================================================

import LabLayout
    from "./components/labtechnician/LabLayout";

import LabDashboard
    from "./pages/labtechnician/LabDashboard";

import DoctorPrescriptions
    from "./pages/labtechnician/DoctorPrescriptions";

import PendingTests
    from "./pages/labtechnician/PendingTests";

import LabTestDetails
    from "./pages/labtechnician/LabTestDetails";

import EnterLabResult
    from "./pages/labtechnician/EnterLabResult";

import CompletedTests
    from "./pages/labtechnician/CompletedTests";

import TestManagement
    from "./pages/labtechnician/TestManagement";

import LaboratoryReports
    from "./pages/labtechnician/LaboratoryReports";

import LaboratoryReportDetails
    from "./pages/labtechnician/LaboratoryReportDetails";

import LaboratoryBilling
    from "./pages/labtechnician/LaboratoryBilling";

import LaboratoryBillDetails
    from "./pages/labtechnician/LaboratoryBillDetails";

import LaboratoryPayment
    from "./pages/labtechnician/LaboratoryPayment";


// ============================================================
// PHARMACIST
// ============================================================

import PharmacistLayout
    from "./components/pharmacist/PharmacistLayout";


// ============================================================
// RECEPTIONIST
// ============================================================

import ReceptionistDashboard
    from "./pages/receptionist/Dashboard";

import PatientList
    from "./pages/receptionist/patients/PatientList";

import RegisterPatient
    from "./pages/receptionist/patients/RegisterPatient";

import PatientDetails
    from "./pages/receptionist/patients/PatientDetails";

import EditPatient
    from "./pages/receptionist/patients/EditPatient";

import ScheduleAppointment
    from "./pages/receptionist/appointments/ScheduleAppointment";

import AppointmentList
    from "./pages/receptionist/appointments/AppointmentList";

import ReceptionistConsultation
    from "./pages/receptionist/consultation/Consultation";

import Billing
    from "./pages/receptionist/billing/Billing";


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==================================================
                    LOGIN
                    ================================================== */}

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* ==================================================
                    DOCTOR ROUTES
                    ================================================== */}

                <Route
                    path="/doctor"
                    element={
                        <DoctorDashboard />
                    }
                />

                <Route
                    path="/doctor/today"
                    element={
                        <TodayAppointments />
                    }
                />

                <Route
                    path="/doctor/upcoming"
                    element={
                        <UpcomingAppointments />
                    }
                />

                <Route
                    path="/doctor/consultation"
                    element={
                        <StartConsultation />
                    }
                />

                <Route
                    path="/doctor/patient/:appointmentId"
                    element={
                        <PatientFile />
                    }
                />

                <Route
                    path="/doctor/patient/:patientId/history"
                    element={
                        <MedicalHistory />
                    }
                />

                <Route
                    path="/doctor/consultation/:appointmentId"
                    element={
                        <Consultation />
                    }
                />

                <Route
                    path="/doctor/history"
                    element={
                        <ConsultationHistory />
                    }
                />


                {/* ==================================================
                    ADMIN ROUTES
                    ================================================== */}

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >

                    {/* Admin Dashboard */}

                    <Route
                        index
                        element={
                            <AdminDashboard />
                        }
                    />

                    {/* Staff */}

                    <Route
                        path="staff"
                        element={
                            <Staff />
                        }
                    />

                    {/* Departments */}

                    <Route
                        path="departments"
                        element={
                            <Departments />
                        }
                    />

                    {/* Medicines */}

                    <Route
                        path="medicines"
                        element={
                            <Medicines />
                        }
                    />

                    {/* Lab Tests */}

                    <Route
                        path="lab-tests"
                        element={
                            <LabTest />
                        }
                    />

                </Route>


                {/* ==================================================
                    LAB TECHNICIAN ROUTES
                    ================================================== */}

                <Route
                    path="/lab-technician"
                    element={
                        <LabLayout />
                    }
                >

                    {/* Dashboard */}

                    <Route
                        index
                        element={
                            <LabDashboard />
                        }
                    />

                    {/* Doctor Lab Prescriptions */}

                    <Route
                        path="doctor-prescriptions"
                        element={
                            <DoctorPrescriptions />
                        }
                    />

                    {/* Pending Tests */}

                    <Route
                        path="pending-tests"
                        element={
                            <PendingTests />
                        }
                    />

                    {/* Test Details */}

                    <Route
                        path="tests/:requestId"
                        element={
                            <LabTestDetails />
                        }
                    />

                    {/* Enter Lab Result */}

                    <Route
                        path="tests/:requestId/result"
                        element={
                            <EnterLabResult />
                        }
                    />

                    {/* Completed Tests */}

                    <Route
                        path="completed-tests"
                        element={
                            <CompletedTests />
                        }
                    />

                    {/* Test Management */}

                    <Route
                        path="test-management"
                        element={
                            <TestManagement />
                        }
                    />

                    {/* Laboratory Reports */}

                    <Route
                        path="reports"
                        element={
                            <LaboratoryReports />
                        }
                    />

                    {/* Laboratory Report Details */}

                    <Route
                        path="reports/:reportId"
                        element={
                            <LaboratoryReportDetails />
                        }
                    />

                    {/* Laboratory Payment */}

                    <Route
                        path="payment/:billId"
                        element={
                            <LaboratoryPayment />
                        }
                    />

                    {/* Laboratory Billing */}

                    <Route
                        path="billing"
                        element={
                            <LaboratoryBilling />
                        }
                    />

                    {/* Laboratory Bill Details */}

                    <Route
                        path="billing/:billId"
                        element={
                            <LaboratoryBillDetails />
                        }
                    />

                </Route>


                {/* ==================================================
                    RECEPTIONIST ROUTES
                    ================================================== */}

                <Route
                    path="/receptionist"
                    element={<ReceptionistDashboard />}
                />

                <Route
                    path="/patients"
                    element={<PatientList />}
                />

                <Route
                    path="/patients/register"
                    element={<RegisterPatient />}
                />

                <Route
                    path="/patients/:patientId"
                    element={<PatientDetails />}
                />

                <Route
                    path="/patients/:patientId/edit"
                    element={<EditPatient />}
                />

                <Route
                    path="/appointments"
                    element={<ScheduleAppointment />}
                />

                <Route
                    path="/appointments/schedule"
                    element={<ScheduleAppointment />}
                />

                <Route
                    path="/appointments/list"
                    element={<AppointmentList />}
                />

                <Route
                    path="/consultation"
                    element={<ReceptionistConsultation />}
                />

                <Route
                    path="/billing"
                    element={<Billing />}
                />


                {/* ==================================================
                    PHARMACIST ROUTES
                    ================================================== */}

                <Route
                    path="/pharmacist"
                    element={
                        <PharmacistLayout />
                    }
                />


                {/* ==================================================
                    UNKNOWN ROUTES
                    ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>

        </BrowserRouter>

    );
}


export default App;