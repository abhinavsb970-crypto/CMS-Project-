from rest_framework import serializers

from .models import Patient, Appointment, Bill


class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient

        fields = [
            "id",
            "patient_id",
            "first_name",
            "last_name",
            "date_of_birth",
            "gender",
            "phone",
            "email",
            "address",
            "emergency_name",
            "emergency_phone",
            "blood_group",
            "insurance",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_id",
            "created_at",
            "updated_at",
        ]


class AppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Appointment

        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "department",
            "department_name",
            "appointment_date",
            "appointment_time",
            "token_number",
            "appointment_type",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "token_number",
            "status",
            "created_at",
            "updated_at",
            "patient_name",
            "doctor_name",
            "department_name",
        ]

    def get_patient_name(self, obj):
        return (
            f"{obj.patient.first_name} "
            f"{obj.patient.last_name}"
        )

    def get_doctor_name(self, obj):
        return obj.doctor.staff.user.get_full_name()

class BillSerializer(serializers.ModelSerializer):

    patient_id = serializers.CharField(
        source="appointment.patient.patient_id",
        read_only=True
    )

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    appointment_date = serializers.DateField(
        source="appointment.appointment_date",
        read_only=True
    )

    appointment_time = serializers.TimeField(
        source="appointment.appointment_time",
        read_only=True
    )

    class Meta:
        model = Bill

        fields = [
            "id",
            "appointment",
            "patient_id",
            "patient_name",
            "doctor_name",
            "appointment_date",
            "appointment_time",
            "consultation_fee",
            "registration_fee",
            "total_amount",
            "payment_status",
            "payment_method",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_id",
            "patient_name",
            "doctor_name",
            "appointment_date",
            "appointment_time",
            "consultation_fee",
            "registration_fee",
            "total_amount",
            "created_at",
            "updated_at",
        ]

    def get_patient_name(self, obj):
        return (
            f"{obj.appointment.patient.first_name} "
            f"{obj.appointment.patient.last_name}"
        )

    def get_doctor_name(self, obj):
        return obj.appointment.doctor.staff.user.get_full_name()


