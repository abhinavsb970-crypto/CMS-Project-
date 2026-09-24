from rest_framework import serializers

from .models import (
    Medicine,
    StockHistory,
    PharmacyPatient,
    PharmacyPrescription,
    PrescriptionMedicine,
    IssuedPrescription,
    IssuedMedicine,
    PharmacyBill,
)


# =========================================================
# MEDICINE SERIALIZER
# =========================================================

class MedicineSerializer(serializers.ModelSerializer):

    master_medicine_name = serializers.CharField(
        source="master_medicine.name",
        read_only=True
    )

    class Meta:

        model = Medicine

        fields = [
            "id",
            "master_medicine",
            "master_medicine_name",
            "name",
            "medicine_type",
            "batch_no",
            "manufacture_date",
            "expiry_date",
            "stock",
            "price",
            "status",
            "created_at",
        ]


# =========================================================
# STOCK HISTORY SERIALIZER
# =========================================================

class StockHistorySerializer(serializers.ModelSerializer):

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    class Meta:

        model = StockHistory

        fields = [
            "id",
            "medicine",
            "medicine_name",
            "previous_stock",
            "new_stock",
            "change",
            "transaction_type",
            "created_at",
        ]


# =========================================================
# PHARMACY PATIENT SERIALIZER
# =========================================================

class PharmacyPatientSerializer(serializers.ModelSerializer):

    class Meta:

        model = PharmacyPatient

        fields = [
            "id",
            "patient_id",
            "name",
            "created_at",
        ]


# =========================================================
# PRESCRIPTION MEDICINE SERIALIZER
# =========================================================

class PrescriptionMedicineSerializer(serializers.ModelSerializer):

    class Meta:

        model = PrescriptionMedicine

        fields = [
            "id",
            "prescription",
            "medicine_name",
            "dosage",
            "duration",
            "prescribed_quantity",
        ]

        extra_kwargs = {
            "prescription": {
                "read_only": True
            }
        }


# =========================================================
# PHARMACY PRESCRIPTION SERIALIZER
# =========================================================

class PharmacyPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="patient.patient_id",
        read_only=True
    )

    medicines = PrescriptionMedicineSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = PharmacyPrescription

        fields = [
            "id",
            "patient",
            "patient_id",
            "patient_name",
            "appointment_id",
            "appointment_date",
            "doctor_name",
            "is_issued",
            "created_at",
            "medicines",
        ]


# =========================================================
# ISSUED MEDICINE SERIALIZER
# =========================================================

class IssuedMedicineSerializer(serializers.ModelSerializer):

    medicine_name_display = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    class Meta:

        model = IssuedMedicine

        fields = [
            "id",
            "issued_prescription",
            "medicine",
            "medicine_name",
            "medicine_name_display",
            "issued_quantity",
            "price_at_issue",
        ]

        extra_kwargs = {
            "issued_prescription": {
                "read_only": True
            }
        }


# =========================================================
# ISSUED PRESCRIPTION SERIALIZER
# =========================================================

class IssuedPrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="prescription.patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="prescription.patient.patient_id",
        read_only=True
    )

    appointment_id = serializers.CharField(
        source="prescription.appointment_id",
        read_only=True
    )

    doctor_name = serializers.CharField(
        source="prescription.doctor_name",
        read_only=True
    )

    medicines = IssuedMedicineSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = IssuedPrescription

        fields = [
            "id",
            "prescription",
            "patient_id",
            "patient_name",
            "appointment_id",
            "doctor_name",
            "issued_at",
            "medicines",
        ]


# =========================================================
# PHARMACY BILL SERIALIZER
# =========================================================

class PharmacyBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="issued_prescription.prescription.patient.name",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="issued_prescription.prescription.patient.patient_id",
        read_only=True
    )

    class Meta:

        model = PharmacyBill

        fields = [
            "id",
            "issued_prescription",
            "patient_id",
            "patient_name",
            "bill_number",
            "total_amount",
            "payment_method",
            "bill_date",
        ]


# =========================================================
# DOCTOR PRESCRIPTION SERIALIZERS
# READ-ONLY DATA FROM DOCTOR MODULE
# =========================================================

class DoctorPrescribedMedicineSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    medicine_id = serializers.IntegerField(
        source="medicine.id"
    )

    medicine_name = serializers.CharField(
        source="medicine.name"
    )

    frequency = serializers.CharField()

    duration = serializers.IntegerField()

    instructions = serializers.CharField()

    route = serializers.CharField()

    quantity = serializers.IntegerField()


class DoctorPrescriptionSerializer(serializers.Serializer):

    consultation_id = serializers.IntegerField(
        source="id"
    )

    patient_id = serializers.CharField(
        source="appointment.patient.patient_id"
    )

    patient_name = serializers.SerializerMethodField()

    appointment_id = serializers.IntegerField(
        source="appointment.id"
    )

    appointment_date = serializers.DateField(
        source="appointment.appointment_date"
    )

    doctor_name = serializers.SerializerMethodField()

    medicines = DoctorPrescribedMedicineSerializer(
        source="prescribed_medicines",
        many=True,
        read_only=True
    )

    def get_patient_name(self, obj):

        patient = obj.appointment.patient

        return (
            f"{patient.first_name} "
            f"{patient.last_name}"
        ).strip()

    def get_doctor_name(self, obj):

        doctor = obj.appointment.doctor

        if doctor and doctor.staff and doctor.staff.user:

            return (
                doctor.staff.user.get_full_name()
                or doctor.staff.user.username
            )

        return 
    