from django.urls import path

from .views import (
    TodayAppointmentsView,
    UpcomingAppointmentsView,
    StartConsultationListView,
    StartConsultationView,
    SaveConsultationView,
    PatientFileView,
    MedicalHistoryView,
    DoctorMedicineListView,
    DoctorLabTestListView,
    ConsultationHistoryView,
)


urlpatterns = [

    # Appointments
    path(
        "appointments/today/",
        TodayAppointmentsView.as_view(),
        name="today-appointments"
    ),

    path(
        "appointments/upcoming/",
        UpcomingAppointmentsView.as_view(),
        name="upcoming-appointments"
    ),


    # Consultation
    path(
        "consultations/start/",
        StartConsultationListView.as_view(),
        name="start-consultation-list"
    ),

    path(
        "consultations/start/<int:appointment_id>/",
        StartConsultationView.as_view(),
        name="start-consultation"
    ),

    path(
        "consultations/save/<int:appointment_id>/",
        SaveConsultationView.as_view(),
        name="save-consultation"
    ),


    # Patient
    path(
        "patients/<int:appointment_id>/",
        PatientFileView.as_view(),
        name="patient-file"
    ),

    path(
        "patients/<str:patient_id>/history/",
        MedicalHistoryView.as_view(),
        name="medical-history"
    ),


    # Master data - Doctor read only
    path(
        "masters/medicines/",
        DoctorMedicineListView.as_view(),
        name="doctor-medicines"
    ),

    path(
        "masters/lab-tests/",
        DoctorLabTestListView.as_view(),
        name="doctor-lab-tests"
    ),


    # Consultation History
    path(
        "history/",
        ConsultationHistoryView.as_view(),
        name="consultation-history"
    ),
]