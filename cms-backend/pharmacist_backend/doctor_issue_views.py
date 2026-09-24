from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import IssuedPrescription
from .serializers import IssuedPrescriptionSerializer
from .services.issue_doctor_prescription_service import (
    issue_doctor_prescription,
)


class IssueDoctorPrescriptionView(APIView):
    """
    Issue medicines from a completed Doctor consultation.
    """

    def post(
        self,
        request,
        consultation_id
    ):

        try:

            issued_prescription = (
                issue_doctor_prescription(
                    consultation_id
                )
            )

        except ValueError as error:

            return Response(
                {
                    "detail": str(error)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # Reload with related data for serializer
        # -------------------------------------------------

        issued_prescription = (
            IssuedPrescription.objects
            .select_related(
                "consultation",
                "consultation__appointment",
                "consultation__appointment__patient",
                "consultation__appointment__doctor",
            )
            .prefetch_related(
                "medicines",
                "medicines__medicine",
            )
            .get(
                id=issued_prescription.id
            )
        )

        serializer = (
            IssuedPrescriptionSerializer(
                issued_prescription
            )
        )

        return Response(
            {
                "message":
                "Doctor prescription issued successfully.",

                "issued_prescription":
                serializer.data,
            },
            status=status.HTTP_201_CREATED
        )