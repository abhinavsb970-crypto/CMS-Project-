from doctor_backend.models import Consultation


def get_doctor_prescriptions():
    """
    Return completed doctor consultations that contain at least
    one prescribed medicine and have NOT yet been issued by Pharmacy.
    This is read-only data for Pharmacy.
    """

    return (
        Consultation.objects
        .filter(
            appointment__status="COMPLETED",
            prescribed_medicines__isnull=False,
            pharmacy_issued_prescription__isnull=True,
        )
        .select_related(
            "appointment",
            "appointment__patient",
            "appointment__doctor",
            "appointment__doctor__staff",
            "appointment__doctor__staff__user",
        )
        .prefetch_related(
            "prescribed_medicines__medicine"
        )
        .distinct()
        .order_by("-created_at")
    )


def get_doctor_prescription(consultation_id):
    """
    Return one completed doctor consultation containing
    prescribed medicines.

    This detail endpoint can still retrieve a prescription
    even if it has already been issued.
    """

    return (
        Consultation.objects
        .filter(
            id=consultation_id,
            appointment__status="COMPLETED",
            prescribed_medicines__isnull=False,
        )
        .select_related(
            "appointment",
            "appointment__patient",
            "appointment__doctor",
            "appointment__doctor__staff",
            "appointment__doctor__staff__user",
        )
        .prefetch_related(
            "prescribed_medicines__medicine"
        )
        .distinct()
        .first()
    )