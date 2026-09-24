from doctor_backend.models import Consultation
from .doctor_service import get_current_doctor


def get_patient_medical_history(user, patient_id):

    doctor = get_current_doctor(user)

    return Consultation.objects.filter(

        appointment__doctor=doctor,

        appointment__patient__patient_id=patient_id,

        appointment__status="COMPLETED",

    ).select_related(

        "appointment",
        "appointment__patient",

    ).prefetch_related(

        "prescribed_medicines__medicine",

        "prescribed_lab_tests__lab_test",

    ).order_by("-created_at")


def get_consultation_history(
    user,
    patient_id=None,
    patient_name=None
):

    doctor = get_current_doctor(user)

    consultations = Consultation.objects.filter(

        appointment__doctor=doctor,

        appointment__status="COMPLETED",

    ).select_related(

        "appointment",
        "appointment__patient",

    ).order_by("-created_at")

    if patient_id:

        consultations = consultations.filter(
            appointment__patient__patient_id__icontains=patient_id
        )

    if patient_name:

        from django.db.models import Q

        consultations = consultations.filter(
            Q(
                appointment__patient__first_name__icontains=patient_name
            )
            |
            Q(
                appointment__patient__last_name__icontains=patient_name
            )
        )

    return consultations