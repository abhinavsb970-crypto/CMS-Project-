from django.contrib import admin

from .models import (
    Patient,
    DoctorAvailability,
    Appointment,
    Bill
)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = (
        "patient_id",
        "first_name",
        "last_name",
        "phone",
        "is_active",
        "created_at",
    )
    search_fields = (
        "patient_id",
        "first_name",
        "last_name",
        "phone",
    )
    list_filter = (
        "is_active",
        "gender",
        "blood_group",
    )


@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = (
        "doctor",
        "day_of_week",
        "start_time",
        "end_time",
        "is_available",
    )
    list_filter = (
        "day_of_week",
        "is_available",
    )


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "patient",
        "doctor",
        "department",
        "appointment_date",
        "appointment_time",
        "token_number",
        "appointment_type",
        "status",
    )
    list_filter = (
        "appointment_type",
        "status",
        "appointment_date",
    )
    search_fields = (
        "patient__patient_id",
        "patient__first_name",
        "patient__last_name",
    )

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "appointment",
        "consultation_fee",
        "registration_fee",
        "total_amount",
        "payment_status",
        "payment_method",
        "created_at",
    )

    list_filter = (
        "payment_status",
        "payment_method",
    )

    search_fields = (
        "appointment__patient__patient_id",
        "appointment__patient__first_name",
        "appointment__patient__last_name",
    )