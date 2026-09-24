from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction

from admin_backend.models import Medicine, LabTest
from receptionist_backend.models import Appointment

from doctor_backend.models import (
    Consultation,
    PrescribedMedicine,
    PrescribedLabTest,
)

from .appointment_service import get_doctor_appointments


def start_consultation(user, appointment_id):

    appointment = get_doctor_appointments(user).filter(
        id=appointment_id
    ).first()

    if not appointment:
        raise PermissionDenied(
            "Appointment not found or does not belong to this doctor."
        )

    if appointment.status == "COMPLETED":
        raise ValidationError(
            "This consultation has already been completed."
        )

    if appointment.status == "CANCELLED":
        raise ValidationError(
            "Cancelled appointments cannot be consulted."
        )

    if appointment.status == "SCHEDULED":
        appointment.status = "IN_CONSULTATION"
        appointment.save(update_fields=["status"])

    elif appointment.status != "IN_CONSULTATION":
        raise ValidationError(
            "This appointment cannot be started for consultation."
        )

    return appointment


@transaction.atomic
def save_consultation(
    user,
    appointment_id,
    symptoms,
    diagnosis,
    doctor_notes="",
    medicines=None,
    lab_tests=None,
):
    """
    Save a consultation and its prescriptions.

    Medicines and lab tests are optional.

    A consultation can be saved only once for an appointment.
    After saving, the appointment becomes COMPLETED.
    """

    medicines = medicines or []
    lab_tests = lab_tests or []

    # ---------------------------------------------------------
    # GET APPOINTMENT
    # ---------------------------------------------------------

    appointment = get_doctor_appointments(user).filter(
        id=appointment_id
    ).first()

    if not appointment:
        raise PermissionDenied(
            "Appointment not found or does not belong to this doctor."
        )

    # ---------------------------------------------------------
    # APPOINTMENT STATUS VALIDATION
    # ---------------------------------------------------------

    if appointment.status == "COMPLETED":
        raise ValidationError(
            "This consultation has already been completed."
        )

    if appointment.status == "CANCELLED":
        raise ValidationError(
            "Cancelled appointments cannot be completed."
        )

    if appointment.status not in [
        "SCHEDULED",
        "IN_CONSULTATION",
    ]:
        raise ValidationError(
            "This appointment is not available for consultation."
        )

    # ---------------------------------------------------------
    # REQUIRED FIELD VALIDATION
    # ---------------------------------------------------------

    if not symptoms or not symptoms.strip():
        raise ValidationError(
            "Symptoms are required."
        )

    if not diagnosis or not diagnosis.strip():
        raise ValidationError(
            "Diagnosis is required."
        )

    # ---------------------------------------------------------
    # PREVENT SECOND CONSULTATION
    # ---------------------------------------------------------

    if Consultation.objects.filter(
        appointment=appointment
    ).exists():

        raise ValidationError(
            "A consultation already exists for this appointment."
        )

    # ---------------------------------------------------------
    # DUPLICATE MEDICINE VALIDATION
    # ---------------------------------------------------------

    medicine_ids = [
        medicine_data.get("medicine_id")
        for medicine_data in medicines
    ]

    if len(medicine_ids) != len(set(medicine_ids)):
        raise ValidationError(
            "The same medicine cannot be prescribed twice."
        )

    # ---------------------------------------------------------
    # DUPLICATE LAB TEST VALIDATION
    # ---------------------------------------------------------

    lab_test_ids = [
        lab_data.get("lab_test_id")
        for lab_data in lab_tests
    ]

    if len(lab_test_ids) != len(set(lab_test_ids)):
        raise ValidationError(
            "The same lab test cannot be prescribed twice."
        )

    # ---------------------------------------------------------
    # VALIDATE MEDICINES BEFORE CREATING CONSULTATION
    # ---------------------------------------------------------

    validated_medicines = []

    for medicine_data in medicines:

        medicine_id = medicine_data.get("medicine_id")

        medicine = Medicine.objects.filter(
            id=medicine_id,
            is_active=True
        ).first()

        if not medicine:
            raise ValidationError(
                "Invalid or inactive medicine."
            )

        required_fields = [
            "frequency",
            "duration",
            "instructions",
            "route",
            "quantity",
        ]

        for field in required_fields:

            if medicine_data.get(field) in [
                None,
                ""
            ]:
                raise ValidationError(
                    f"{field} is required for medicine."
                )

        if int(medicine_data["duration"]) <= 0:
            raise ValidationError(
                "Medicine duration must be greater than zero."
            )

        if int(medicine_data["quantity"]) <= 0:
            raise ValidationError(
                "Medicine quantity must be greater than zero."
            )

        validated_medicines.append(
            {
                "medicine": medicine,
                "frequency": medicine_data["frequency"],
                "duration": medicine_data["duration"],
                "instructions": medicine_data["instructions"],
                "route": medicine_data["route"],
                "quantity": medicine_data["quantity"],
            }
        )

    # ---------------------------------------------------------
    # VALIDATE LAB TESTS BEFORE CREATING CONSULTATION
    # ---------------------------------------------------------

    validated_lab_tests = []

    for lab_data in lab_tests:

        lab_test_id = lab_data.get("lab_test_id")

        lab_test = LabTest.objects.filter(
            id=lab_test_id,
            is_active=True
        ).first()

        if not lab_test:
            raise ValidationError(
                "Invalid or inactive lab test."
            )

        validated_lab_tests.append(
            lab_test
        )

    # ---------------------------------------------------------
    # CREATE CONSULTATION
    # ---------------------------------------------------------

    consultation = Consultation.objects.create(
        appointment=appointment,
        symptoms=symptoms.strip(),
        diagnosis=diagnosis.strip(),
        doctor_notes=doctor_notes.strip()
        if doctor_notes
        else "",
    )

    # ---------------------------------------------------------
    # CREATE MEDICINE PRESCRIPTIONS
    # ---------------------------------------------------------

    for medicine_data in validated_medicines:

        PrescribedMedicine.objects.create(
            consultation=consultation,
            medicine=medicine_data["medicine"],
            frequency=medicine_data["frequency"],
            duration=medicine_data["duration"],
            instructions=medicine_data["instructions"],
            route=medicine_data["route"],
            quantity=medicine_data["quantity"],
        )

    # ---------------------------------------------------------
    # CREATE LAB TEST PRESCRIPTIONS
    # ---------------------------------------------------------

    for lab_test in validated_lab_tests:

        PrescribedLabTest.objects.create(
            consultation=consultation,
            lab_test=lab_test,
        )

    # ---------------------------------------------------------
    # COMPLETE APPOINTMENT
    # ---------------------------------------------------------

    appointment.status = "COMPLETED"

    appointment.save(
        update_fields=["status"]
    )

    return consultation