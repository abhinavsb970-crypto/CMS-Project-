from rest_framework import serializers

from .models import (
    LabTestRequest,
    LabResult,
    LaboratoryReport,
    LaboratoryBill,
)

from admin_backend.models import LabTest

from doctor_backend.models import (
    Consultation,
    PrescribedLabTest,
)


# =========================================================
# LAB TEST MANAGEMENT SERIALIZER
# =========================================================


class LabTestManagementSerializer(serializers.ModelSerializer):

    department = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = LabTest

        fields = [
            "id",
            "test_code",
            "test_name",
            "department",
            "sample_type",
            "price",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "department",
            "created_at",
            "updated_at",
        ]

    def validate_test_code(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Test ID is required."
            )

        return value

    def validate_test_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Test Name is required."
            )

        if not all(
            character.isalpha() or character.isspace()
            for character in value
        ):
            raise serializers.ValidationError(
                "Test Name must contain alphabetic characters only."
            )

        return value

    def validate_sample_type(self, value):
        return value.strip()

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value


# =========================================================
# DOCTOR LAB PRESCRIPTION SERIALIZER
# =========================================================
#
# This serializer is READ-ONLY.
#
# It is used by the Lab module to display lab tests that
# were prescribed by the Doctor during a completed
# consultation.
#
# Doctor:
# Consultation
#      ↓
# PrescribedLabTest
#      ↓
# This serializer
#      ↓
# Lab Technician
#
# =========================================================


class DoctorLabPrescriptionSerializer(serializers.ModelSerializer):

    consultation_id = serializers.IntegerField(
        source="consultation.id",
        read_only=True
    )

    patient_id = serializers.CharField(
        source="consultation.appointment.patient.patient_id",
        read_only=True
    )

    patient_name = serializers.SerializerMethodField()

    appointment_id = serializers.IntegerField(
        source="consultation.appointment.id",
        read_only=True
    )

    appointment_date = serializers.DateField(
        source="consultation.appointment.appointment_date",
        read_only=True
    )

    doctor_name = serializers.SerializerMethodField()

    lab_test_id = serializers.IntegerField(
        source="lab_test.id",
        read_only=True
    )

    test_code = serializers.CharField(
        source="lab_test.test_code",
        read_only=True
    )

    test_name = serializers.CharField(
        source="lab_test.test_name",
        read_only=True
    )

    category = serializers.CharField(
        source="lab_test.category",
        read_only=True
    )

    sample_type = serializers.CharField(
        source="lab_test.sample_type",
        read_only=True
    )

    price = serializers.DecimalField(
        source="lab_test.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    is_active = serializers.BooleanField(
        source="lab_test.is_active",
        read_only=True
    )

    def get_patient_name(self, obj):

        patient = obj.consultation.appointment.patient

        if patient:
            return (
                f"{patient.first_name} "
                f"{patient.last_name}"
            ).strip()

        return None

    def get_doctor_name(self, obj):

        doctor = obj.consultation.appointment.doctor

        if doctor and doctor.staff and doctor.staff.user:
            return doctor.staff.user.get_full_name()

        return None

    class Meta:
        model = PrescribedLabTest

        fields = [
            "id",

            # Doctor consultation
            "consultation_id",

            # Appointment / Patient
            "appointment_id",
            "appointment_date",
            "patient_id",
            "patient_name",

            # Doctor
            "doctor_name",

            # Lab test
            "lab_test_id",
            "test_code",
            "test_name",
            "category",
            "sample_type",
            "price",
            "is_active",
        ]

        read_only_fields = fields


# =========================================================
# LAB TEST REQUEST SERIALIZER
# =========================================================


class LabTestRequestSerializer(serializers.ModelSerializer):

    test_code = serializers.CharField(
        source="lab_test.test_code",
        read_only=True
    )

    test_name = serializers.CharField(
        source="lab_test.test_name",
        read_only=True
    )

    category = serializers.CharField(
        source="lab_test.category",
        read_only=True
    )

    sample_type = serializers.CharField(
        source="lab_test.sample_type",
        read_only=True
    )

    technician_id = serializers.CharField(
        source="assigned_technician.staff_id",
        read_only=True,
        allow_null=True
    )

    technician_name = serializers.SerializerMethodField()

    lab_result = serializers.SerializerMethodField()
    result_remarks = serializers.SerializerMethodField()
    result_technician_id = serializers.SerializerMethodField()
    result_technician_name = serializers.SerializerMethodField()
    completed_at = serializers.SerializerMethodField()

    # ---------------------------------------------------------
    # Doctor prescription source
    # ---------------------------------------------------------

    doctor_prescription_id = serializers.IntegerField(
        source="doctor_prescription.id",
        read_only=True,
        allow_null=True
    )

    consultation_id = serializers.IntegerField(
        source="doctor_prescription.consultation.id",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = LabTestRequest

        fields = [
            "id",
            "request_id",

            # Doctor prescription connection
            "doctor_prescription",
            "doctor_prescription_id",
            "consultation_id",

            # Patient / Doctor
            "patient_id",
            "doctor_id",

            # Lab test
            "lab_test",
            "test_code",
            "test_name",
            "category",
            "sample_type",

            # Technician
            "assigned_technician",
            "technician_id",
            "technician_name",

            # Status
            "status",

            # Result
            "lab_result",
            "result_remarks",
            "result_technician_id",
            "result_technician_name",
            "completed_at",

            # Dates
            "requested_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "request_id",

            "doctor_prescription",
            "doctor_prescription_id",
            "consultation_id",

            "test_code",
            "test_name",
            "category",
            "sample_type",

            "technician_id",
            "technician_name",

            "lab_result",
            "result_remarks",
            "result_technician_id",
            "result_technician_name",
            "completed_at",

            "requested_at",
            "updated_at",
        ]

    def get_technician_name(self, obj):

        if obj.assigned_technician:
            return obj.assigned_technician.user.get_full_name()

        return None

    def get_lab_result(self, obj):

        try:
            return obj.result_record.result

        except LabResult.DoesNotExist:
            return None

    def get_result_remarks(self, obj):

        try:
            return obj.result_record.remarks

        except LabResult.DoesNotExist:
            return None

    def get_result_technician_id(self, obj):

        try:
            return obj.result_record.entered_by.staff_id

        except LabResult.DoesNotExist:
            return None

    def get_result_technician_name(self, obj):

        try:
            technician = obj.result_record.entered_by

            if technician:
                return technician.user.get_full_name()

            return None

        except LabResult.DoesNotExist:
            return None

    def get_completed_at(self, obj):

        try:
            return obj.result_record.completed_at

        except LabResult.DoesNotExist:
            return None


# =========================================================
# LAB RESULT SERIALIZER
# =========================================================


class LabResultSerializer(serializers.ModelSerializer):

    request_id = serializers.CharField(
        source="request.request_id",
        read_only=True
    )

    test_name = serializers.CharField(
        source="request.lab_test.test_name",
        read_only=True
    )

    patient_id = serializers.IntegerField(
        source="request.patient_id",
        read_only=True
    )

    technician_id = serializers.CharField(
        source="entered_by.staff_id",
        read_only=True
    )

    technician_name = serializers.SerializerMethodField()

    class Meta:
        model = LabResult

        fields = [
            "id",
            "request",
            "request_id",
            "test_name",
            "patient_id",
            "result",
            "remarks",
            "entered_by",
            "technician_id",
            "technician_name",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "request_id",
            "test_name",
            "patient_id",
            "entered_by",
            "technician_id",
            "technician_name",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def get_technician_name(self, obj):

        if obj.entered_by:
            return obj.entered_by.user.get_full_name()

        return None

    def validate(self, attrs):

        instance = self.instance

        if instance:

            lab_request = instance.request

            if lab_request.status == "COMPLETED":
                raise serializers.ValidationError(
                    "Completed laboratory test results cannot be edited."
                )

            if lab_request.status == "CANCELLED":
                raise serializers.ValidationError(
                    "Cancelled laboratory test results cannot be edited."
                )

        return attrs


# =========================================================
# CREATE LAB RESULT SERIALIZER
# =========================================================


class LabResultCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabResult

        fields = [
            "request",
            "result",
            "remarks",
        ]

        extra_kwargs = {
            "result": {
                "required": True
            },
            "remarks": {
                "required": False,
                "allow_blank": True
            },
        }

    def validate_request(self, value):

        if value.status == "COMPLETED":
            raise serializers.ValidationError(
                "This lab test has already been completed."
            )

        if value.status == "CANCELLED":
            raise serializers.ValidationError(
                "A cancelled lab test cannot receive a result."
            )

        if hasattr(value, "result_record"):
            raise serializers.ValidationError(
                "A result has already been entered for this test."
            )

        return value


# =========================================================
# LABORATORY REPORT SERIALIZER
# =========================================================


class LaboratoryReportSerializer(serializers.ModelSerializer):

    request_id = serializers.CharField(
        source="request.request_id",
        read_only=True
    )

    patient_id = serializers.IntegerField(
        source="request.patient_id",
        read_only=True
    )

    test_code = serializers.CharField(
        source="request.lab_test.test_code",
        read_only=True
    )

    test_name = serializers.CharField(
        source="request.lab_test.test_name",
        read_only=True
    )

    sample_type = serializers.CharField(
        source="request.lab_test.sample_type",
        read_only=True
    )

    lab_result = serializers.CharField(
        source="result.result",
        read_only=True
    )

    remarks = serializers.CharField(
        source="result.remarks",
        read_only=True
    )

    technician_id = serializers.CharField(
        source="generated_by.staff_id",
        read_only=True
    )

    technician_name = serializers.SerializerMethodField()

    class Meta:
        model = LaboratoryReport

        fields = [
            "id",
            "report_id",
            "request",
            "request_id",
            "patient_id",
            "test_code",
            "test_name",
            "sample_type",
            "result",
            "lab_result",
            "remarks",
            "generated_by",
            "technician_id",
            "technician_name",
            "generated_at",
        ]

        read_only_fields = [
            "id",
            "report_id",
            "request",
            "request_id",
            "patient_id",
            "test_code",
            "test_name",
            "sample_type",
            "result",
            "lab_result",
            "remarks",
            "generated_by",
            "technician_id",
            "technician_name",
            "generated_at",
        ]

    def get_technician_name(self, obj):

        if obj.generated_by:
            return obj.generated_by.user.get_full_name()

        return None


# =========================================================
# LABORATORY BILL SERIALIZER
# =========================================================


class LaboratoryBillSerializer(serializers.ModelSerializer):

    bill_id = serializers.CharField(
        read_only=True
    )

    report_id = serializers.CharField(
        source="report.report_id",
        read_only=True
    )

    request_id = serializers.CharField(
        source="report.request.request_id",
        read_only=True
    )

    test_code = serializers.CharField(
        source="report.request.lab_test.test_code",
        read_only=True
    )

    test_name = serializers.CharField(
        source="report.request.lab_test.test_name",
        read_only=True
    )

    sample_type = serializers.CharField(
        source="report.request.lab_test.sample_type",
        read_only=True
    )

    technician_id = serializers.CharField(
        source="report.generated_by.staff_id",
        read_only=True
    )

    technician_name = serializers.SerializerMethodField()

    class Meta:
        model = LaboratoryBill

        fields = [
            "id",
            "bill_id",
            "report",
            "report_id",
            "request_id",
            "patient_id",
            "test_code",
            "test_name",
            "sample_type",
            "amount",
            "payment_status",
            "payment_method",
            "paid_at",
            "technician_id",
            "technician_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "bill_id",
            "report_id",
            "request_id",
            "test_code",
            "test_name",
            "sample_type",
            "amount",
            "paid_at",
            "technician_id",
            "technician_name",
            "created_at",
            "updated_at",
        ]

    def get_technician_name(self, obj):

        if obj.report.generated_by:
            return obj.report.generated_by.user.get_full_name()

        return None