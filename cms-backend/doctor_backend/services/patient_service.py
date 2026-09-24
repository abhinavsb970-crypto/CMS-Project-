from django.core.exceptions import PermissionDenied

from .appointment_service import get_doctor_appointments


def get_patient_file(user, appointment_id):
    appointment = get_doctor_appointments(user).filter(
        id=appointment_id
    ).select_related("patient").first()

    if not appointment:
        raise PermissionDenied(
            "Appointment not found or does not belong to this doctor."
        )

    return appointment