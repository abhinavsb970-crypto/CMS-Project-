from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .permissions import IsDoctor

from .serializers import (
    DoctorAppointmentSerializer,
    SaveConsultationSerializer,
    PatientFileSerializer,
    MedicalHistorySerializer,
    DoctorMedicineSerializer,
    DoctorLabTestSerializer,
    ConsultationHistoryListSerializer,
)

from .services.appointment_service import (
    get_today_appointments,
    get_upcoming_appointments,
    get_consultation_appointments,
)

from .services.consultation_service import (
    start_consultation,
    save_consultation,
)

from .services.patient_service import (
    get_patient_file,
)

from .services.history_service import (
    get_patient_medical_history,
    get_consultation_history,
)

from .services.master_service import (
    get_active_medicines,
    get_active_lab_tests,
)


# =========================================================
# TODAY APPOINTMENTS
# =========================================================

class TodayAppointmentsView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        appointments = get_today_appointments(
            request.user
        )

        serializer = DoctorAppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# UPCOMING APPOINTMENTS
# =========================================================

class UpcomingAppointmentsView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        appointments = get_upcoming_appointments(
            request.user
        )

        serializer = DoctorAppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# START CONSULTATION LIST
# =========================================================

class StartConsultationListView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        appointments = get_consultation_appointments(
            request.user
        )

        serializer = DoctorAppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# START CONSULTATION
# =========================================================

class StartConsultationView(APIView):

    permission_classes = [IsDoctor]

    def post(self, request, appointment_id):

        appointment = start_consultation(
            request.user,
            appointment_id
        )

        serializer = DoctorAppointmentSerializer(
            appointment
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# =========================================================
# SAVE CONSULTATION
# =========================================================

class SaveConsultationView(APIView):

    permission_classes = [IsDoctor]

    def post(self, request, appointment_id):

        serializer = SaveConsultationSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        consultation = save_consultation(

            user=request.user,

            appointment_id=appointment_id,

            symptoms=serializer.validated_data[
                "symptoms"
            ],

            diagnosis=serializer.validated_data[
                "diagnosis"
            ],

            doctor_notes=serializer.validated_data.get(
                "doctor_notes",
                ""
            ),

            medicines=serializer.validated_data.get(
                "medicines",
                []
            ),

            lab_tests=serializer.validated_data.get(
                "lab_tests",
                []
            ),
        )

        return Response(
            {
                "message":
                    "Consultation saved successfully.",

                "consultation_id":
                    consultation.id
            },
            status=status.HTTP_201_CREATED
        )


# =========================================================
# PATIENT FILE
# =========================================================

class PatientFileView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request, appointment_id):

        appointment = get_patient_file(
            request.user,
            appointment_id
        )

        serializer = PatientFileSerializer(
            appointment
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# =========================================================
# MEDICAL HISTORY
# =========================================================

class MedicalHistoryView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request, patient_id):

        consultations = get_patient_medical_history(
            request.user,
            patient_id
        )

        serializer = MedicalHistorySerializer(
            consultations,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# =========================================================
# MEDICINE MASTER - READ ONLY FOR DOCTOR
# =========================================================

class DoctorMedicineListView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        medicines = get_active_medicines()

        serializer = DoctorMedicineSerializer(
            medicines,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# LAB MASTER - READ ONLY FOR DOCTOR
# =========================================================

class DoctorLabTestListView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        lab_tests = get_active_lab_tests()

        serializer = DoctorLabTestSerializer(
            lab_tests,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# CONSULTATION HISTORY SEARCH
# =========================================================

class ConsultationHistoryView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        patient_id = request.query_params.get(
            "patient_id"
        )

        patient_name = request.query_params.get(
            "patient_name"
        )

        consultations = get_consultation_history(

            request.user,

            patient_id=patient_id,

            patient_name=patient_name
        )

        serializer = ConsultationHistoryListSerializer(
            consultations,
            many=True
        )

        return Response(serializer.data)