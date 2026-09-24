from django.contrib import admin
from django.urls import path, include



urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/auth/",
        include("admin_backend.urls")
    ),

    path(
        "api/admin/",
        include("admin_backend.urls")
    ),

    path(
        "api/doctor/",
        include("doctor_backend.urls")
    ),

    path(
        "api/receptionist/",
        include("receptionist_backend.urls")
    ),
    path(
            "api/pharmacist/",
            include("pharmacist_backend.urls")
        ),
    path("api/lab-technician/", include("lab_technician.urls")),
]