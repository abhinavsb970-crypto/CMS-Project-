from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from admin_backend.models import LabTest, Staff

from doctor_backend.models import (
    PrescribedLabTest,
)

from .models import (
    LabTestRequest,
    LabResult,
    LaboratoryReport,
    LaboratoryBill,
)

from .serializers import (
    LabTestManagementSerializer,
    LabTestRequestSerializer,
    LabResultSerializer,
    LabResultCreateSerializer,
    LaboratoryReportSerializer,
    LaboratoryBillSerializer,
    DoctorLabPrescriptionSerializer,
)

from .permissions import IsLabTechnician


# ============================================================
# DOCTOR LAB PRESCRIPTIONS
#
# Shows completed Doctor consultations that contain lab tests
# prescribed by the Doctor and which have NOT yet been allotted.
#
# DOCTOR
#    ↓
# CONSULTATION
#    ↓
# PRESCRIBED LAB TEST
#    ↓
# THIS API
#    ↓
# LAB TECHNICIAN
#
# ============================================================


class DoctorLabPrescriptionListView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        queryset = (
            PrescribedLabTest.objects
            .filter(
                consultation__appointment__status="COMPLETED",
                consultation__appointment__doctor__isnull=False,
                lab_test__is_active=True,
                lab_test_request__isnull=True,
            )
            .select_related(
                "consultation",
                "consultation__appointment",
                "consultation__appointment__patient",
                "consultation__appointment__doctor",
                "consultation__appointment__doctor__staff",
                "consultation__appointment__doctor__staff__user",
                "lab_test",
                "lab_test__department",
            )
            .order_by(
                "-consultation__created_at"
            )
        )

        serializer = DoctorLabPrescriptionSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ALLOT DOCTOR LAB PRESCRIPTION
#
# Creates the existing LabTestRequest from the Doctor's
# PrescribedLabTest.
#
# POST
#
# /doctor-prescriptions/<prescription_id>/allot/
#
# Request body:
#
# {
#     "technician_id": 5
# }
#
# technician_id is optional.
#
# If it is not provided, the currently logged-in Lab
# Technician will be assigned.
#
# ============================================================


class AllotDoctorLabPrescriptionView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def post(self, request, prescription_id):

        current_technician = request.user.staff_profile

        # ----------------------------------------------------
        # FIND DOCTOR PRESCRIPTION
        # ----------------------------------------------------

        doctor_prescription = get_object_or_404(
            PrescribedLabTest.objects.select_related(
                "consultation",
                "consultation__appointment",
                "consultation__appointment__patient",
                "consultation__appointment__doctor",
                "lab_test",
            ),
            id=prescription_id
        )

        consultation = doctor_prescription.consultation

        appointment = consultation.appointment

        lab_test = doctor_prescription.lab_test

        # ----------------------------------------------------
        # CONSULTATION MUST BE COMPLETED
        # ----------------------------------------------------

        if appointment.status != "COMPLETED":

            return Response(
                {
                    "detail": (
                        "Lab tests can only be allotted from "
                        "a completed Doctor consultation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # LAB TEST MUST BE ACTIVE
        # ----------------------------------------------------

        if not lab_test.is_active:

            return Response(
                {
                    "detail": (
                        "This laboratory test is inactive "
                        "and cannot be allotted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # PREVENT DUPLICATE ALLOTMENT
        # ----------------------------------------------------

        if hasattr(
            doctor_prescription,
            "lab_test_request"
        ):

            return Response(
                {
                    "detail": (
                        "This Doctor lab prescription "
                        "has already been allotted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # DETERMINE TECHNICIAN
        # ----------------------------------------------------

        technician_id = request.data.get(
            "technician_id"
        )

        if technician_id:

            try:
                technician_id = int(technician_id)

            except (TypeError, ValueError):

                return Response(
                    {
                        "technician_id": [
                            "Technician ID must be a valid number."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            technician = (
                Staff.objects
                .select_related("user")
                .filter(
                    id=technician_id,
                    role="LAB_TECHNICIAN"
                )
                .first()
            )

            if not technician:

                return Response(
                    {
                        "technician_id": [
                            "The selected staff member is not "
                            "a Lab Technician."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        else:

            technician = current_technician

        # ----------------------------------------------------
        # GET PATIENT
        # ----------------------------------------------------

        patient = appointment.patient

        # ----------------------------------------------------
        # GET DOCTOR
        # ----------------------------------------------------

        doctor = appointment.doctor

        # ----------------------------------------------------
        # CREATE LAB REQUEST
        #
        # transaction.atomic() ensures that the Doctor
        # prescription and Lab request connection is created
        # safely.
        # ----------------------------------------------------

        with transaction.atomic():

            lab_request = LabTestRequest.objects.create(
                doctor_prescription=doctor_prescription,

                # Existing Lab module fields are retained.
                # These fields use the actual database IDs.
                patient_id=patient.id,

                doctor_id=doctor.id if doctor else None,

                lab_test=lab_test,

                assigned_technician=technician,

                status="PENDING",
            )

        # ----------------------------------------------------
        # SERIALIZE CREATED REQUEST
        # ----------------------------------------------------

        serializer = LabTestRequestSerializer(
            lab_request
        )

        return Response(
            {
                "message": (
                    "Doctor lab prescription allotted "
                    "successfully."
                ),
                "lab_request": serializer.data,
            },
            status=status.HTTP_201_CREATED
        )


# ============================================================
# TEST MANAGEMENT
# LAB TECHNICIAN CAN ONLY VIEW / SEARCH LAB TESTS
# ADMIN IS THE ONLY ONE WHO MANAGES LAB TEST MASTER
# ============================================================


class LabTestManagementView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        search_by = request.query_params.get(
            "search_by",
            ""
        ).strip()

        queryset = (
            LabTest.objects
            .select_related("department")
            .all()
        )

        if search:

            if search_by == "test_id":

                queryset = queryset.filter(
                    Q(id__iexact=search) |
                    Q(test_code__iexact=search)
                )

            elif search_by == "test_name":

                queryset = queryset.filter(
                    test_name__icontains=search
                )

            else:

                queryset = queryset.filter(
                    Q(test_code__icontains=search) |
                    Q(test_name__icontains=search)
                )

        queryset = queryset.order_by("id")

        serializer = LabTestManagementSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# TEST MANAGEMENT DETAIL
# ============================================================


class LabTestManagementDetailView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request, pk):

        lab_test = get_object_or_404(
            LabTest.objects.select_related("department"),
            pk=pk
        )

        serializer = LabTestManagementSerializer(
            lab_test
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# PENDING LAB TESTS
# ============================================================


class PendingLabTestsView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        technician = request.user.staff_profile

        queryset = (
            LabTestRequest.objects
            .filter(
                assigned_technician=technician
            )
            .exclude(
                status__in=[
                    "COMPLETED",
                    "CANCELLED"
                ]
            )
            .select_related(
                "lab_test",
                "assigned_technician",
                "doctor_prescription",
                "doctor_prescription__consultation",
            )
            .order_by("-requested_at")
        )

        serializer = LabTestRequestSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# LAB TEST DETAILS
# ============================================================


class LabTestDetailView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request, request_id):

        technician = request.user.staff_profile

        lab_request = get_object_or_404(
            LabTestRequest.objects.select_related(
                "lab_test",
                "assigned_technician",
                "doctor_prescription",
                "doctor_prescription__consultation",
            ),
            request_id=request_id,
            assigned_technician=technician
        )

        serializer = LabTestRequestSerializer(
            lab_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ENTER / UPDATE LAB RESULT
# ============================================================


class EnterLabResultView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    # --------------------------------------------------------
    # CREATE RESULT
    # --------------------------------------------------------

    def post(self, request, request_id):

        technician = request.user.staff_profile

        lab_request = get_object_or_404(
            LabTestRequest,
            request_id=request_id,
            assigned_technician=technician
        )

        if lab_request.status == "COMPLETED":

            return Response(
                {
                    "detail": (
                        "This laboratory test is already completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if lab_request.status == "CANCELLED":

            return Response(
                {
                    "detail": (
                        "Cancelled laboratory tests cannot receive results."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate result

        try:

            lab_request.result_record

            return Response(
                {
                    "detail": (
                        "A result already exists for this test. "
                        "Use Edit Result to modify it."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except LabResult.DoesNotExist:
            pass

        serializer = LabResultCreateSerializer(
            data=request.data,
            context={
                "request": request,
                "lab_request": lab_request,
            }
        )

        if serializer.is_valid():

            result = serializer.save(
                request=lab_request,
                entered_by=technician
            )

            if lab_request.status == "PENDING":

                lab_request.status = "IN_PROGRESS"

                lab_request.save(
                    update_fields=[
                        "status",
                        "updated_at"
                    ]
                )

            response_serializer = LabResultSerializer(
                result
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # UPDATE EXISTING RESULT
    # --------------------------------------------------------

    def put(self, request, request_id):

        technician = request.user.staff_profile

        lab_request = get_object_or_404(
            LabTestRequest,
            request_id=request_id,
            assigned_technician=technician
        )

        if lab_request.status == "COMPLETED":

            return Response(
                {
                    "detail": (
                        "Completed laboratory test results cannot be edited."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if lab_request.status == "CANCELLED":

            return Response(
                {
                    "detail": (
                        "Cancelled laboratory test results cannot be edited."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            result = lab_request.result_record

        except LabResult.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "No laboratory result exists for this test."
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LabResultSerializer(
            result,
            data={
                "result": request.data.get(
                    "result",
                    result.result
                ),
                "remarks": request.data.get(
                    "remarks",
                    result.remarks
                ),
            },
            partial=True
        )

        if serializer.is_valid():

            updated_result = serializer.save()

            response_serializer = LabResultSerializer(
                updated_result
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# COMPLETE LAB TEST
# ============================================================


class CompleteLabTestView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def post(self, request, request_id):

        technician = request.user.staff_profile

        lab_request = get_object_or_404(
            LabTestRequest,
            request_id=request_id,
            assigned_technician=technician
        )

        if lab_request.status == "COMPLETED":

            return Response(
                {
                    "detail": (
                        "This laboratory test is already completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if lab_request.status == "CANCELLED":

            return Response(
                {
                    "detail": (
                        "Cancelled laboratory tests cannot be completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            result = lab_request.result_record

        except LabResult.DoesNotExist:

            result = None

        if not result:

            return Response(
                {
                    "detail": (
                        "Enter the laboratory result before "
                        "completing the test."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        lab_request.status = "COMPLETED"

        lab_request.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        result.completed_at = timezone.now()

        result.save(
            update_fields=[
                "completed_at",
                "updated_at"
            ]
        )

        serializer = LabTestRequestSerializer(
            lab_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# COMPLETED LAB TESTS
# ============================================================


class CompletedLabTestsView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        technician = request.user.staff_profile

        queryset = (
            LabTestRequest.objects
            .filter(
                assigned_technician=technician,
                status="COMPLETED"
            )
            .select_related(
                "lab_test",
                "assigned_technician",
                "doctor_prescription",
                "doctor_prescription__consultation",
            )
            .prefetch_related(
                "result_record"
            )
            .order_by("-updated_at")
        )

        serializer = LabTestRequestSerializer(
            queryset,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# GENERATE LABORATORY REPORT
#
# COMPLETED TEST
#       ↓
# GENERATE REPORT
#       ↓
# AUTOMATICALLY CREATE BILL
#       ↓
# PAYMENT REQUIRED
#
# ============================================================


class GenerateLaboratoryReportView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def post(self, request, request_id):

        technician = request.user.staff_profile

        # ----------------------------------------------------
        # FIND TEST ASSIGNED TO THIS TECHNICIAN
        # ----------------------------------------------------

        lab_request = get_object_or_404(
            LabTestRequest.objects.select_related(
                "lab_test",
                "assigned_technician"
            ),
            request_id=request_id,
            assigned_technician=technician
        )

        # ----------------------------------------------------
        # TEST MUST BE COMPLETED
        # ----------------------------------------------------

        if lab_request.status != "COMPLETED":

            return Response(
                {
                    "detail": (
                        "Laboratory report can only be generated "
                        "for a completed laboratory test."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET LABORATORY RESULT
        # ----------------------------------------------------

        try:

            result = lab_request.result_record

        except LabResult.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "Laboratory result not found. "
                        "Enter the result before generating the report."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CHECK IF REPORT ALREADY EXISTS
        # ----------------------------------------------------

        try:

            existing_report = lab_request.laboratory_report

            report_serializer = LaboratoryReportSerializer(
                existing_report
            )

            # ------------------------------------------------
            # CHECK IF BILL ALREADY EXISTS
            # ------------------------------------------------

            try:

                existing_bill = existing_report.laboratory_bill

                bill_serializer = LaboratoryBillSerializer(
                    existing_bill
                )

                return Response(
                    {
                        "detail": (
                            "Laboratory report and bill already exist."
                        ),
                        "report": report_serializer.data,
                        "bill": bill_serializer.data
                    },
                    status=status.HTTP_200_OK
                )

            except LaboratoryBill.DoesNotExist:

                lab_test = lab_request.lab_test

                bill = LaboratoryBill.objects.create(
                    report=existing_report,
                    patient_id=lab_request.patient_id,
                    test_name=lab_test.test_name,
                    amount=lab_test.price
                )

                bill_serializer = LaboratoryBillSerializer(
                    bill
                )

                return Response(
                    {
                        "detail": (
                            "Laboratory report already exists. "
                            "Laboratory bill created successfully."
                        ),
                        "report": report_serializer.data,
                        "bill": bill_serializer.data
                    },
                    status=status.HTTP_200_OK
                )

        except LaboratoryReport.DoesNotExist:

            pass

        # ----------------------------------------------------
        # CREATE LABORATORY REPORT
        # ----------------------------------------------------

        report = LaboratoryReport.objects.create(
            request=lab_request,
            result=result,
            generated_by=technician
        )

        # ----------------------------------------------------
        # AUTOMATICALLY CREATE LABORATORY BILL
        # ----------------------------------------------------

        lab_test = lab_request.lab_test

        bill = LaboratoryBill.objects.create(
            report=report,
            patient_id=lab_request.patient_id,
            test_name=lab_test.test_name,
            amount=lab_test.price
        )

        # ----------------------------------------------------
        # SERIALIZE REPORT
        # ----------------------------------------------------

        report_serializer = LaboratoryReportSerializer(
            report
        )

        # ----------------------------------------------------
        # SERIALIZE BILL
        # ----------------------------------------------------

        bill_serializer = LaboratoryBillSerializer(
            bill
        )

        # ----------------------------------------------------
        # RETURN REPORT + BILL
        # ----------------------------------------------------

        return Response(
            {
                "detail": (
                    "Laboratory report generated and "
                    "laboratory bill created successfully."
                ),
                "report": report_serializer.data,
                "bill": bill_serializer.data
            },
            status=status.HTTP_201_CREATED
        )


# ============================================================
# LABORATORY REPORTS
# ============================================================


class LaboratoryReportsView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        technician = request.user.staff_profile

        reports = (
            LaboratoryReport.objects
            .filter(
                generated_by=technician
            )
            .select_related(
                "request",
                "request__lab_test",
                "result",
                "generated_by"
            )
            .order_by("-generated_at")
        )

        serializer = LaboratoryReportSerializer(
            reports,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# LABORATORY REPORT DETAIL
# ============================================================


class LaboratoryReportDetailView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request, report_id):

        technician = request.user.staff_profile

        report = get_object_or_404(
            LaboratoryReport.objects.select_related(
                "request",
                "request__lab_test",
                "result",
                "generated_by"
            ),
            report_id=report_id,
            generated_by=technician
        )

        serializer = LaboratoryReportSerializer(
            report
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# CREATE LABORATORY BILL
#
# KEPT FOR BACKWARD COMPATIBILITY.
#
# Normally the bill is now automatically created when
# the laboratory report is generated.
# ============================================================


class CreateLaboratoryBillView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def post(self, request, report_id):

        technician = request.user.staff_profile

        report = get_object_or_404(
            LaboratoryReport.objects.select_related(
                "request",
                "request__lab_test",
                "generated_by"
            ),
            report_id=report_id,
            generated_by=technician
        )

        # ----------------------------------------------------
        # TEST MUST BE COMPLETED
        # ----------------------------------------------------

        if report.request.status != "COMPLETED":

            return Response(
                {
                    "detail": (
                        "Laboratory bill can only be created "
                        "for a completed laboratory test."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # PREVENT DUPLICATE BILL
        # ----------------------------------------------------

        try:

            existing_bill = report.laboratory_bill

            serializer = LaboratoryBillSerializer(
                existing_bill
            )

            return Response(
                {
                    "detail": "Laboratory bill already exists.",
                    "bill": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except LaboratoryBill.DoesNotExist:

            pass

        # ----------------------------------------------------
        # GET TEST MASTER INFORMATION
        # ----------------------------------------------------

        lab_test = report.request.lab_test

        # ----------------------------------------------------
        # CREATE BILL
        # ----------------------------------------------------

        bill = LaboratoryBill.objects.create(
            report=report,
            patient_id=report.request.patient_id,
            test_name=lab_test.test_name,
            amount=lab_test.price
        )

        serializer = LaboratoryBillSerializer(
            bill
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# LABORATORY BILLS
# ============================================================


class LaboratoryBillsView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request):

        technician = request.user.staff_profile

        bills = (
            LaboratoryBill.objects
            .filter(
                report__generated_by=technician
            )
            .select_related(
                "report",
                "report__request",
                "report__request__lab_test",
                "report__generated_by"
            )
            .order_by("-created_at")
        )

        serializer = LaboratoryBillSerializer(
            bills,
            many=True
        )

        return Response(
            serializer.data,
            many=True
        )


# ============================================================
# LABORATORY BILL DETAIL
# ============================================================


class LaboratoryBillDetailView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def get(self, request, bill_id):

        technician = request.user.staff_profile

        bill = get_object_or_404(
            LaboratoryBill.objects.select_related(
                "report",
                "report__request",
                "report__request__lab_test",
                "report__generated_by"
            ),
            bill_id=bill_id,
            report__generated_by=technician
        )

        serializer = LaboratoryBillSerializer(
            bill
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# PAY LABORATORY BILL
#
# CURRENTLY RECORDS PAYMENT.
#
# REAL PAYMENT GATEWAY WILL BE CONNECTED LATER.
# ============================================================


class PayLaboratoryBillView(APIView):

    permission_classes = [IsAuthenticated, IsLabTechnician]

    def post(self, request, bill_id):

        technician = request.user.staff_profile

        bill = get_object_or_404(
            LaboratoryBill.objects.select_related(
                "report",
                "report__generated_by"
            ),
            bill_id=bill_id,
            report__generated_by=technician
        )

        # ----------------------------------------------------
        # ALREADY PAID
        # ----------------------------------------------------

        if bill.payment_status == "PAID":

            return Response(
                {
                    "detail": (
                        "This laboratory bill has already been paid."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CANCELLED BILL
        # ----------------------------------------------------

        if bill.payment_status == "CANCELLED":

            return Response(
                {
                    "detail": (
                        "Cancelled laboratory bills cannot be paid."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET PAYMENT METHOD
        # ----------------------------------------------------

        payment_method = request.data.get(
            "payment_method"
        )

        if not payment_method:

            return Response(
                {
                    "payment_method": [
                        "Payment method is required."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # VALID PAYMENT METHODS
        # ----------------------------------------------------

        valid_payment_methods = [
            "CASH",
            "CARD",
            "UPI",
            "ONLINE",
        ]

        payment_method = payment_method.upper()

        if payment_method not in valid_payment_methods:

            return Response(
                {
                    "payment_method": [
                        "Invalid payment method."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # RECORD PAYMENT
        # ----------------------------------------------------

        bill.payment_method = payment_method
        bill.payment_status = "PAID"
        bill.paid_at = timezone.now()

        bill.save(
            update_fields=[
                "payment_method",
                "payment_status",
                "paid_at",
                "updated_at",
            ]
        )

        # ----------------------------------------------------
        # RETURN UPDATED BILL
        # ----------------------------------------------------

        serializer = LaboratoryBillSerializer(
            bill
        )

        return Response(
            {
                "detail": (
                    "Laboratory bill payment recorded successfully."
                ),
                "bill": serializer.data
            },
            status=status.HTTP_200_OK
        )