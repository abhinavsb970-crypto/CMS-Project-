from django.urls import path

from .views import (
    MedicineListCreateView,
    MedicineDetailView,

    StockHistoryListView,

    PharmacyPatientListCreateView,
    PharmacyPatientDetailView,

    PharmacyPrescriptionListCreateView,
    PharmacyPrescriptionDetailView,

    PrescriptionMedicineCreateView,
    PrescriptionMedicineDetailView,

    IssuePrescriptionView,

    IssuedPrescriptionListView,
    IssuedPrescriptionDetailView,

    PharmacyBillListView,
    GenerateBillView,
    DoctorPrescriptionListView,
    DoctorPrescriptionDetailView,
)
from .doctor_issue_views import (
    IssueDoctorPrescriptionView,
)


urlpatterns = [

    # =====================================================
    # MEDICINE INVENTORY
    # =====================================================

    path(
        "medicines/",
        MedicineListCreateView.as_view(),
        name="medicine-list-create"
    ),

    path(
        "medicines/<int:pk>/",
        MedicineDetailView.as_view(),
        name="medicine-detail"
    ),


    # =====================================================
    # STOCK HISTORY
    # =====================================================

    path(
        "stock-history/",
        StockHistoryListView.as_view(),
        name="stock-history"
    ),


    # =====================================================
    # PHARMACY PATIENTS
    # =====================================================

    path(
        "patients/",
        PharmacyPatientListCreateView.as_view(),
        name="pharmacy-patient-list-create"
    ),

    path(
        "patients/<int:pk>/",
        PharmacyPatientDetailView.as_view(),
        name="pharmacy-patient-detail"
    ),


    # =====================================================
    # PHARMACY PRESCRIPTIONS
    # =====================================================

    path(
        "prescriptions/",
        PharmacyPrescriptionListCreateView.as_view(),
        name="pharmacy-prescription-list-create"
    ),

    path(
        "prescriptions/<int:pk>/",
        PharmacyPrescriptionDetailView.as_view(),
        name="pharmacy-prescription-detail"
    ),


    # =====================================================
    # PRESCRIPTION MEDICINES
    # =====================================================

    path(
        "prescriptions/<int:prescription_id>/medicines/",
        PrescriptionMedicineCreateView.as_view(),
        name="prescription-medicine-create"
    ),

    path(
        "prescription-medicines/<int:pk>/",
        PrescriptionMedicineDetailView.as_view(),
        name="prescription-medicine-detail"
    ),


    # =====================================================
    # ISSUE MEDICINES
    # =====================================================

    path(
        "prescriptions/<int:prescription_id>/issue/",
        IssuePrescriptionView.as_view(),
        name="issue-prescription"
    ),


    # =====================================================
    # ISSUED PRESCRIPTIONS
    # =====================================================

    path(
        "issued-prescriptions/",
        IssuedPrescriptionListView.as_view(),
        name="issued-prescription-list"
    ),

    path(
        "issued-prescriptions/<int:pk>/",
        IssuedPrescriptionDetailView.as_view(),
        name="issued-prescription-detail"
    ),


   # =====================================================
# DOCTOR PRESCRIPTIONS
# READ-ONLY DATA FROM DOCTOR MODULE
# =====================================================

path(
    "doctor-prescriptions/",
    DoctorPrescriptionListView.as_view(),
    name="doctor-prescription-list"
),

path(
    "doctor-prescriptions/<int:pk>/",
    DoctorPrescriptionDetailView.as_view(),
    name="doctor-prescription-detail"
),

path(
    "doctor-prescriptions/<int:consultation_id>/issue/",
    IssueDoctorPrescriptionView.as_view(),
    name="issue-doctor-prescription"
),
    # =====================================================
    # PHARMACY BILLS
    # =====================================================

    path(
        "bills/",
        PharmacyBillListView.as_view(),
        name="pharmacy-bill-list"
    ),

    path(
        "issued-prescriptions/<int:issued_prescription_id>/bill/",
        GenerateBillView.as_view(),
        name="generate-pharmacy-bill"
    ),
]