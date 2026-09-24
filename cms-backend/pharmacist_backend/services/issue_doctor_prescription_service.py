from django.db import transaction
from django.utils import timezone

from doctor_backend.models import Consultation

from ..models import (
    IssuedPrescription,
    IssuedMedicine,
    Medicine,
)


@transaction.atomic
def issue_doctor_prescription(consultation_id):
    """
    Issue medicines prescribed by a Doctor.

    Flow:

    Doctor Consultation
            ↓
    Doctor PrescribedMedicine
            ↓
    Admin Medicine master
            ↓
    Pharmacist Medicine inventory
            ↓
    IssuedPrescription
            ↓
    IssuedMedicine
            ↓
    Reduce stock
    """

    # =====================================================
    # GET COMPLETED DOCTOR CONSULTATION
    # =====================================================

    try:

        consultation = (
            Consultation.objects
            .select_related(
                "appointment",
                "appointment__patient",
                "appointment__doctor",
            )
            .prefetch_related(
                "prescribed_medicines__medicine"
            )
            .get(
                id=consultation_id,
                appointment__status="COMPLETED",
            )
        )

    except Consultation.DoesNotExist:

        raise ValueError(
            "Completed doctor consultation not found."
        )

    # =====================================================
    # CHECK WHETHER ALREADY ISSUED
    # =====================================================

    if IssuedPrescription.objects.filter(
        consultation=consultation
    ).exists():

        raise ValueError(
            "Medicines for this consultation "
            "have already been issued."
        )

    # =====================================================
    # GET DOCTOR PRESCRIBED MEDICINES
    # =====================================================

    prescribed_medicines = (
        consultation.prescribed_medicines.all()
    )

    if not prescribed_medicines.exists():

        raise ValueError(
            "No medicines were prescribed "
            "in this consultation."
        )

    # =====================================================
    # FIND INVENTORY FOR ALL MEDICINES
    # BEFORE CHANGING ANY STOCK
    # =====================================================

    medicine_records = []

    today = timezone.localdate()

    for prescribed_medicine in prescribed_medicines:

        master_medicine = (
            prescribed_medicine.medicine
        )

        required_quantity = (
            prescribed_medicine.quantity
        )

        if required_quantity <= 0:

            raise ValueError(
                f"Invalid quantity for "
                f"'{master_medicine.name}'."
            )

        # -------------------------------------------------
        # FIND ACTIVE, NON-EXPIRED INVENTORY
        # LINKED TO THE ADMIN MEDICINE MASTER
        # -------------------------------------------------

        inventory_medicines = (
            Medicine.objects
            .select_for_update()
            .filter(
                master_medicine=master_medicine,
                status="Active",
                expiry_date__gte=today,
                stock__gt=0,
            )
            .order_by(
                "expiry_date",
                "id",
            )
        )

        inventory_medicines = list(
            inventory_medicines
        )

        if not inventory_medicines:

            raise ValueError(
                f"Medicine "
                f"'{master_medicine.name}' "
                f"is not available in active "
                f"pharmacy inventory."
            )

        # -------------------------------------------------
        # CHECK TOTAL AVAILABLE STOCK
        # -------------------------------------------------

        total_stock = sum(
            medicine.stock
            for medicine in inventory_medicines
        )

        if total_stock < required_quantity:

            raise ValueError(
                f"Insufficient stock for "
                f"'{master_medicine.name}'. "
                f"Available: {total_stock}, "
                f"Required: {required_quantity}."
            )

        # -------------------------------------------------
        # PREPARE BATCHES TO ISSUE
        #
        # We use FEFO:
        # First Expiry, First Out.
        # -------------------------------------------------

        remaining_quantity = (
            required_quantity
        )

        batch_records = []

        for medicine in inventory_medicines:

            if remaining_quantity <= 0:
                break

            issue_quantity = min(
                medicine.stock,
                remaining_quantity,
            )

            batch_records.append(
                (
                    medicine,
                    issue_quantity,
                )
            )

            remaining_quantity -= issue_quantity

        medicine_records.append(
            (
                prescribed_medicine,
                batch_records,
            )
        )

    # =====================================================
    # CREATE ISSUED PRESCRIPTION
    # =====================================================

    issued_prescription = (
        IssuedPrescription.objects.create(
            consultation=consultation
        )
    )

    # =====================================================
    # CREATE ISSUED MEDICINES
    # AND REDUCE STOCK
    # =====================================================

    for (
        prescribed_medicine,
        batch_records,
    ) in medicine_records:

        for (
            medicine,
            issued_quantity,
        ) in batch_records:

            IssuedMedicine.objects.create(

                issued_prescription=
                issued_prescription,

                medicine=medicine,

                medicine_name=medicine.name,

                issued_quantity=issued_quantity,

                price_at_issue=medicine.price,
            )

            # ---------------------------------------------
            # REDUCE INVENTORY STOCK
            # ---------------------------------------------

            medicine.stock -= issued_quantity

            medicine.save()

    # =====================================================
    # RETURN ISSUED PRESCRIPTION
    # =====================================================

    return issued_prescription