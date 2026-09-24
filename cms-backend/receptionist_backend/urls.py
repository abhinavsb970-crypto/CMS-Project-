from django.urls import path

from .views import (
    PatientListCreateView,
    PatientDetailView,
    AvailableSlotsView,
    AppointmentListCreateView,
    AppointmentDetailView,
    BillCreateView,
    BillDetailView,
)


urlpatterns = [

    path(
        "patients/",
        PatientListCreateView.as_view(),
        name="patient-list-create",
    ),

    path(
        "patients/<str:patient_id>/",
        PatientDetailView.as_view(),
        name="patient-detail",
    ),

    path(
        "appointments/available-slots/",
        AvailableSlotsView.as_view(),
        name="available-slots",
    ),

    path(
        "appointments/",
        AppointmentListCreateView.as_view(),
        name="appointment-list-create",
    ),

    path(
        "appointments/<int:appointment_id>/",
        AppointmentDetailView.as_view(),
        name="appointment-detail",
    ),

    path(
        "bills/",
        BillCreateView.as_view(),
        name="bill-create",
    ),

    path(
        "bills/<int:bill_id>/",
        BillDetailView.as_view(),
        name="bill-detail",
    ),
]