from django.urls import path

from .views import (
    DoctorLabPrescriptionListView,
    AllotDoctorLabPrescriptionView,

    LabTestManagementView,
    LabTestManagementDetailView,

    PendingLabTestsView,
    LabTestDetailView,

    EnterLabResultView,
    CompleteLabTestView,
    CompletedLabTestsView,

    GenerateLaboratoryReportView,

    LaboratoryReportsView,
    LaboratoryReportDetailView,

    CreateLaboratoryBillView,
    LaboratoryBillsView,
    LaboratoryBillDetailView,
    PayLaboratoryBillView,
)


urlpatterns = [

    # ========================================================
    # DOCTOR → LAB
    # ========================================================

    path(
        "doctor-prescriptions/",
        DoctorLabPrescriptionListView.as_view(),
        name="doctor-lab-prescriptions"
    ),

    path(
        "doctor-prescriptions/<int:prescription_id>/allot/",
        AllotDoctorLabPrescriptionView.as_view(),
        name="allot-doctor-lab-prescription"
    ),


    # ========================================================
    # LAB TEST MANAGEMENT
    # ========================================================

    path(
        "test-management/",
        LabTestManagementView.as_view(),
        name="lab-test-management"
    ),

    path(
        "test-management/<int:pk>/",
        LabTestManagementDetailView.as_view(),
        name="lab-test-management-detail"
    ),


    # ========================================================
    # LAB TEST REQUESTS
    # ========================================================

    path(
        "pending-tests/",
        PendingLabTestsView.as_view(),
        name="pending-lab-tests"
    ),

    path(
        "tests/<str:request_id>/",
        LabTestDetailView.as_view(),
        name="lab-test-detail"
    ),

    path(
        "tests/<str:request_id>/result/",
        EnterLabResultView.as_view(),
        name="enter-lab-result"
    ),

    path(
        "tests/<str:request_id>/complete/",
        CompleteLabTestView.as_view(),
        name="complete-lab-test"
    ),

    path(
        "completed-tests/",
        CompletedLabTestsView.as_view(),
        name="completed-lab-tests"
    ),


    # ========================================================
    # LABORATORY REPORT
    # ========================================================

    path(
        "tests/<str:request_id>/report/",
        GenerateLaboratoryReportView.as_view(),
        name="generate-laboratory-report"
    ),

    path(
        "reports/",
        LaboratoryReportsView.as_view(),
        name="laboratory-reports"
    ),

    path(
        "reports/<str:report_id>/",
        LaboratoryReportDetailView.as_view(),
        name="laboratory-report-detail"
    ),


    # ========================================================
    # LABORATORY BILL
    # ========================================================

    path(
        "reports/<str:report_id>/bill/",
        CreateLaboratoryBillView.as_view(),
        name="create-laboratory-bill"
    ),

    path(
        "bills/",
        LaboratoryBillsView.as_view(),
        name="laboratory-bills"
    ),

    path(
        "bills/<str:bill_id>/",
        LaboratoryBillDetailView.as_view(),
        name="laboratory-bill-detail"
    ),

    path(
        "bills/<str:bill_id>/pay/",
        PayLaboratoryBillView.as_view(),
        name="pay-laboratory-bill"
    ),
]