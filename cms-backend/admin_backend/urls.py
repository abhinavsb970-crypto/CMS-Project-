from django.urls import path

from .views import (
    LoginView,
    RefreshTokenView,
    MeView,
    AdminTestView,
    StaffListView,
    StaffCreateView,
    StaffDetailView,
    DoctorListView,
    DepartmentListCreateView,
    DepartmentDetailView,
    MedicineListCreateView,
    MedicineDetailView,
    LabTestListCreateView,
    LabTestDetailView,
)


urlpatterns = [

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),
    path(
    "refresh/",
    RefreshTokenView.as_view(),
    name="token-refresh"
),

    path(
        "me/",
        MeView.as_view(),
        name="me"
    ),

    path(
        "admin-test/",
        AdminTestView.as_view(),
        name="admin-test"
    ),

    path(
        "staff/",
        StaffListView.as_view(),
        name="staff-list"
    ),

    path(
        "staff/create/",
        StaffCreateView.as_view(),
        name="staff-create"
    ),

    path(
        "staff/<str:staff_id>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),
    path(
    "departments/",
    DepartmentListCreateView.as_view(),
    name="department-list-create"
),

path(
    "departments/<int:pk>/",
    DepartmentDetailView.as_view(),
    name="department-detail"
),
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
path(
    "lab-tests/",
    LabTestListCreateView.as_view(),
    name="lab-test-list-create"
),

path(
    "lab-tests/<int:pk>/",
    LabTestDetailView.as_view(),
    name="lab-test-detail"
),

path(
    "doctors/",
    DoctorListView.as_view(),
    name="doctor-list",
),
]