from django.utils import timezone
from django.core.exceptions import PermissionDenied

from receptionist_backend.models import Appointment

from .doctor_service import get_current_doctor


def get_doctor_appointments(user):
    doctor = get_current_doctor(user)

    return Appointment.objects.filter(
        doctor=doctor
    ).select_related(
        "patient",
        "doctor",
        "department"
    )


def get_today_appointments(user):
    appointments = get_doctor_appointments(user)

    today = timezone.localdate()

    return appointments.filter(
        appointment_date=today
    ).exclude(
        status="CANCELLED"
    )


def get_upcoming_appointments(user):
    appointments = get_doctor_appointments(user)

    today = timezone.localdate()

    return appointments.filter(
        appointment_date__gt=today
    ).exclude(
        status__in=[
            "CANCELLED",
            "COMPLETED"
        ]
    )


def get_consultation_appointments(user):
    appointments = get_doctor_appointments(user)

    today = timezone.localdate()

    return appointments.filter(
        appointment_date=today,
        status__in=[
            "SCHEDULED",
            "IN_CONSULTATION"
        ]
    )