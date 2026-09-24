from rest_framework import serializers

from .models import Consultation


# ---------------------------------------------------------
# APPOINTMENT
# ---------------------------------------------------------

class DoctorAppointmentSerializer(serializers.Serializer):

    appointment_id = serializers.IntegerField(
        source="id"
    )

    patient_id = serializers.CharField(
        source="patient.patient_id"
    )

    patient_name = serializers.SerializerMethodField()

    appointment_date = serializers.DateField()

    appointment_time = serializers.TimeField()

    token_number = serializers.IntegerField()

    status = serializers.CharField()

    def get_patient_name(self, obj):

        return (
            f"{obj.patient.first_name} "
            f"{obj.patient.last_name}"
        ).strip()


# ---------------------------------------------------------
# SAVE CONSULTATION
# ---------------------------------------------------------

class PrescriptionMedicineInputSerializer(
    serializers.Serializer
):

    medicine_id = serializers.IntegerField(
        min_value=1
    )

    frequency = serializers.CharField(
        allow_blank=False
    )

    duration = serializers.IntegerField(
        min_value=1
    )

    instructions = serializers.CharField(
        allow_blank=False
    )

    route = serializers.CharField(
        allow_blank=False
    )

    quantity = serializers.IntegerField(
        min_value=1
    )


class PrescriptionLabTestInputSerializer(
    serializers.Serializer
):

    lab_test_id = serializers.IntegerField(
        min_value=1
    )


class SaveConsultationSerializer(
    serializers.Serializer
):

    symptoms = serializers.CharField(
        allow_blank=False
    )

    diagnosis = serializers.CharField(
        allow_blank=False
    )

    doctor_notes = serializers.CharField(
        required=False,
        allow_blank=True
    )

    medicines = PrescriptionMedicineInputSerializer(
        many=True,
        required=False,
        allow_empty=True
    )

    lab_tests = PrescriptionLabTestInputSerializer(
        many=True,
        required=False,
        allow_empty=True
    )


# ---------------------------------------------------------
# PATIENT FILE
# ---------------------------------------------------------

class PatientFileSerializer(serializers.Serializer):

    patient_id = serializers.CharField()

    patient_name = serializers.CharField()

    age = serializers.SerializerMethodField()

    gender = serializers.CharField()

    blood_group = serializers.CharField()

    phone = serializers.CharField()

    address = serializers.CharField()

    appointment_id = serializers.IntegerField()

    consult_date = serializers.DateField()

    token_number = serializers.IntegerField()

    appointment_time = serializers.TimeField()

    def get_age(self, obj):

        from datetime import date

        today = date.today()

        dob = obj.patient.date_of_birth

        if not dob:
            return None

        age = today.year - dob.year

        if (today.month, today.day) < (
            dob.month,
            dob.day
        ):
            age -= 1

        return age

    def to_representation(self, obj):

        return {
            "patient_id": obj.patient.patient_id,

            "patient_name": (
                f"{obj.patient.first_name} "
                f"{obj.patient.last_name}"
            ).strip(),

            "age": self.get_age(obj),

            "gender": obj.patient.gender,

            "blood_group": obj.patient.blood_group,

            "phone": obj.patient.phone,

            "address": obj.patient.address,

            "appointment_id": obj.id,

            "consult_date": obj.appointment_date,

            "token_number": obj.token_number,

            "appointment_time": obj.appointment_time,
        }


# ---------------------------------------------------------
# MEDICAL HISTORY
# ---------------------------------------------------------

class HistoryMedicineSerializer(serializers.Serializer):

    medicine_name = serializers.CharField()

    frequency = serializers.CharField()

    duration = serializers.IntegerField()

    instructions = serializers.CharField()

    route = serializers.CharField()

    quantity = serializers.IntegerField()

    def to_representation(self, obj):

        return {
            "medicine_name": obj.medicine.name,

            "frequency": obj.frequency,

            "duration": obj.duration,

            "instructions": obj.instructions,

            "route": obj.route,

            "quantity": obj.quantity,
        }


class HistoryLabTestSerializer(serializers.Serializer):

    test_name = serializers.CharField()

    test_code = serializers.CharField()

    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def to_representation(self, obj):

        result = None
        remarks = None
        completed_at = None
        request_id = None
        status = None
        technician_id = None
        technician_name = None
        report_id = None

        # -------------------------------------------------
        # Doctor Prescription
        # -------------------------------------------------

        response = {
            "test_name": obj.lab_test.test_name,

            "test_code": obj.lab_test.test_code,

            "price": obj.lab_test.price,
        }

        # -------------------------------------------------
        # LAB TEST REQUEST
        # -------------------------------------------------

        try:

            lab_request = obj.lab_test_request

            request_id = lab_request.request_id

            status = lab_request.status

            # -------------------------------------------------
            # LAB RESULT
            # -------------------------------------------------

            try:

                lab_result = lab_request.result_record

                result = lab_result.result

                remarks = lab_result.remarks

                completed_at = lab_result.completed_at

                # -------------------------------------------------
                # RESULT TECHNICIAN
                # -------------------------------------------------

                if lab_result.entered_by:

                    technician_id = (
                        lab_result.entered_by.staff_id
                    )

                    technician_name = (
                        lab_result.entered_by.user.get_full_name()
                    )

            except Exception:

                pass

            # -------------------------------------------------
            # LABORATORY REPORT
            # -------------------------------------------------

            try:

                laboratory_report = (
                    lab_request.laboratory_report
                )

                report_id = (
                    laboratory_report.report_id
                )

            except Exception:

                pass

        except Exception:

            pass

        # -------------------------------------------------
        # ADD LAB PROCESSING INFORMATION
        # -------------------------------------------------

        response.update({

            "request_id": request_id,

            "status": status,

            "result": result,

            "remarks": remarks,

            "technician_id": technician_id,

            "technician_name": technician_name,

            "completed_at": completed_at,

            "report_id": report_id,
        })

        return response


class MedicalHistorySerializer(serializers.Serializer):

    consultation_id = serializers.IntegerField(
        source="id"
    )

    consultation_date = serializers.DateTimeField(
        source="created_at"
    )

    patient_id = serializers.CharField(
        source="appointment.patient.patient_id"
    )

    patient_name = serializers.SerializerMethodField()

    symptoms = serializers.CharField()

    diagnosis = serializers.CharField()

    doctor_notes = serializers.CharField()

    medicines = serializers.SerializerMethodField()

    lab_tests = serializers.SerializerMethodField()

    def get_patient_name(self, obj):

        patient = obj.appointment.patient

        return (
            f"{patient.first_name} "
            f"{patient.last_name}"
        ).strip()

    def get_medicines(self, obj):

        medicines = obj.prescribed_medicines.all()

        return HistoryMedicineSerializer(
            medicines,
            many=True
        ).data

    def get_lab_tests(self, obj):

        lab_tests = obj.prescribed_lab_tests.all()

        return HistoryLabTestSerializer(
            lab_tests,
            many=True
        ).data


# ---------------------------------------------------------
# MASTER DATA
# ---------------------------------------------------------

class DoctorMedicineSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    name = serializers.CharField()

    generic_name = serializers.CharField()

    brand_name = serializers.CharField()

    formulation = serializers.CharField()

    strength = serializers.CharField()

    unit = serializers.CharField()


class DoctorLabTestSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    test_code = serializers.CharField()

    test_name = serializers.CharField()

    category = serializers.CharField()

    sample_type = serializers.CharField()

    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )


# ---------------------------------------------------------
# CONSULTATION HISTORY SEARCH
# ---------------------------------------------------------

class ConsultationHistoryListSerializer(
    serializers.Serializer
):

    consultation_id = serializers.IntegerField(
        source="id"
    )

    patient_id = serializers.CharField(
        source="appointment.patient.patient_id"
    )

    patient_name = serializers.SerializerMethodField()

    consultation_date = serializers.DateTimeField(
        source="created_at"
    )

    diagnosis = serializers.CharField()

    def get_patient_name(self, obj):

        patient = obj.appointment.patient

        return (
            f"{patient.first_name} "
            f"{patient.last_name}"
        ).strip()