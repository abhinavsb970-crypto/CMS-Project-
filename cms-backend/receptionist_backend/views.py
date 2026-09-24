from datetime import datetime, timedelta
from django.db.models import Q

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_backend.models import DoctorProfile

from .models import Patient, DoctorAvailability, Appointment, Bill
from .permissions import IsReceptionist
from .serializers import PatientSerializer, AppointmentSerializer, BillSerializer

from decimal import Decimal


class PatientListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get(self, request):

        search = request.query_params.get("search", "").strip()

        patients = Patient.objects.all().order_by("-created_at")

        if search:
            patients = patients.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(patient_id__icontains=search)
            )

        serializer = PatientSerializer(
            patients,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = PatientSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        patient = serializer.save()

        return Response(
            PatientSerializer(patient).data,
            status=status.HTTP_201_CREATED
        )


class PatientDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get_object(self, patient_id):

        return get_object_or_404(
            Patient,
            patient_id=patient_id
        )

    def get(self, request, patient_id):

        patient = self.get_object(patient_id)

        serializer = PatientSerializer(patient)

        return Response(serializer.data)

    def put(self, request, patient_id):

        patient = self.get_object(patient_id)

        serializer = PatientSerializer(
            patient,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        patient = serializer.save()

        return Response(
            PatientSerializer(patient).data
        )

    def patch(self, request, patient_id):

        patient = self.get_object(patient_id)

        serializer = PatientSerializer(
            patient,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        patient = serializer.save()

        return Response(
            PatientSerializer(patient).data
        )

class AvailableSlotsView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get(self, request):

        doctor_id = request.query_params.get("doctor")
        appointment_date = request.query_params.get("date")

        if not doctor_id:
            return Response(
                {"detail": "doctor is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not appointment_date:
            return Response(
                {"detail": "date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            selected_date = datetime.strptime(
                appointment_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {
                    "detail":
                    "Invalid date format. Use YYYY-MM-DD."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        doctor = get_object_or_404(
            DoctorProfile,
            pk=doctor_id
        )

        day_of_week = selected_date.weekday()

        availability = (
            DoctorAvailability.objects
            .filter(
                doctor=doctor,
                day_of_week=day_of_week,
                is_available=True,
            )
            .first()
        )

        if not availability:
            return Response({
                "doctor": doctor.id,
                "date": selected_date,
                "slots": [],
            })

        booked_times = set(
            Appointment.objects.filter(
                doctor=doctor,
                appointment_date=selected_date,
                status="SCHEDULED",
            ).values_list(
                "appointment_time",
                flat=True
            )
        )

        slots = []

        current_time = datetime.combine(
            selected_date,
            availability.start_time
        )

        end_time = datetime.combine(
            selected_date,
            availability.end_time
        )

        while current_time < end_time:

            slot_time = current_time.time()

            if slot_time not in booked_times:
                slots.append(
                    slot_time.strftime("%H:%M")
                )

            current_time += timedelta(minutes=15)

        return Response({
            "doctor": doctor.id,
            "doctor_name": doctor.staff.user.get_full_name(),
            "department": doctor.department.id,
            "department_name": doctor.department.name,
            "date": selected_date,
            "slots": slots,
        })

class AppointmentListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get(self, request):

        appointment_date = request.query_params.get("date")
        status_filter = request.query_params.get("status")

        appointments = (
            Appointment.objects
            .select_related(
                "patient",
                "doctor__staff__user",
                "department",
            )
            .all()
        )

        if appointment_date:
            appointments = appointments.filter(
                appointment_date=appointment_date
            )

        if status_filter:
            appointments = appointments.filter(
                status=status_filter
            )

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        patient_id = request.data.get("patient")
        doctor_id = request.data.get("doctor")
        appointment_date = request.data.get("appointment_date")
        appointment_time = request.data.get("appointment_time")
        appointment_type = request.data.get("appointment_type")

        if not all([
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            appointment_type,
        ]):
            return Response(
                {
                    "detail": (
                        "patient, doctor, appointment_date, "
                        "appointment_time and appointment_type "
                        "are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Validate patient
        # --------------------------------------------------

        patient = get_object_or_404(
            Patient,
            patient_id=patient_id,
            is_active=True,
        )

        # --------------------------------------------------
        # Validate doctor
        # --------------------------------------------------

        doctor = get_object_or_404(
            DoctorProfile.objects.select_related(
                "staff__user",
                "department",
            ),
            pk=doctor_id,
            staff__is_active=True,
        )

        # --------------------------------------------------
        # Validate appointment type
        # --------------------------------------------------

        valid_types = {
            choice[0]
            for choice in Appointment.APPOINTMENT_TYPE_CHOICES
        }

        if appointment_type not in valid_types:
            return Response(
                {
                    "detail": "Invalid appointment type."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Parse date
        # --------------------------------------------------

        try:
            selected_date = datetime.strptime(
                appointment_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {
                    "detail":
                    "Invalid appointment_date. "
                    "Use YYYY-MM-DD."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Parse time
        # --------------------------------------------------

        try:
            selected_time = datetime.strptime(
                appointment_time,
                "%H:%M"
            ).time()
        except ValueError:
            return Response(
                {
                    "detail":
                    "Invalid appointment_time. "
                    "Use HH:MM."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        today = datetime.now().date()

        # --------------------------------------------------
        # Appointment date rules
        # --------------------------------------------------

        if appointment_type == "CONSULTATION":

            if selected_date != today:
                return Response(
                    {
                        "detail":
                        "Consultation can only be booked for today."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif appointment_type == "PRIOR":

            minimum_date = today + timedelta(days=2)
            maximum_date = today + timedelta(days=365)

            if selected_date < minimum_date:
                return Response(
                    {
                        "detail":
                        "Prior appointments must be booked "
                        "at least 2 days in advance."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if selected_date > maximum_date:
                return Response(
                    {
                        "detail":
                        "Prior appointments can only be booked "
                        "up to 1 year in advance."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # --------------------------------------------------
        # Find doctor's availability for selected day
        # --------------------------------------------------

        availability = (
            DoctorAvailability.objects
            .filter(
                doctor=doctor,
                day_of_week=selected_date.weekday(),
                is_available=True,
            )
            .first()
        )

        if not availability:
            return Response(
                {
                    "detail":
                    "Doctor is not available on this day."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Validate time is inside working hours
        # --------------------------------------------------

        if not (
            availability.start_time
            <= selected_time
            < availability.end_time
        ):
            return Response(
                {
                    "detail":
                    "Selected time is outside the doctor's "
                    "working hours."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Validate 15-minute interval
        # --------------------------------------------------

        start_minutes = (
            availability.start_time.hour * 60
            + availability.start_time.minute
        )

        selected_minutes = (
            selected_time.hour * 60
            + selected_time.minute
        )

        if (
            selected_minutes - start_minutes
        ) % 15 != 0:

            return Response(
                {
                    "detail":
                    "Appointments must use 15-minute time slots."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # Generate token + create appointment atomically
        # --------------------------------------------------

        try:

            with transaction.atomic():

                last_appointment = (
                    Appointment.objects
                    .select_for_update()
                    .filter(
                        doctor=doctor,
                        appointment_date=selected_date,
                        status="SCHEDULED",
                    )
                    .order_by("-token_number")
                    .first()
                )

                if last_appointment:
                    next_token = (
                        last_appointment.token_number + 1
                    )
                else:
                    next_token = 1

                appointment = Appointment.objects.create(
                    patient=patient,
                    doctor=doctor,
                    department=doctor.department,
                    appointment_date=selected_date,
                    appointment_time=selected_time,
                    token_number=next_token,
                    appointment_type=appointment_type,
                    status="SCHEDULED",
                )

        except IntegrityError:

            return Response(
                {
                    "detail":
                    "This time slot was just booked. "
                    "Please choose another slot."
                },
                status=status.HTTP_409_CONFLICT
            )

        return Response(
            AppointmentSerializer(
                appointment
            ).data,
            status=status.HTTP_201_CREATED
        )

class BillCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    REGISTRATION_FEE = Decimal("200.00")

    def post(self, request):

        appointment_id = request.data.get("appointment")

        if not appointment_id:
            return Response(
                {
                    "detail": "appointment is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment = get_object_or_404(
            Appointment.objects.select_related(
                "patient",
                "doctor__staff__user",
                "department",
            ),
            pk=appointment_id,
        )

        # Prevent duplicate bills
        if hasattr(appointment, "bill"):
            return Response(
                {
                    "detail":
                    "A bill already exists for this appointment."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Doctor's consultation fee is the source of truth
        consultation_fee = Decimal(
            appointment.doctor.consultation_fee
        )

        # New patient = no previous appointment
        has_previous_appointment = (
            Appointment.objects
            .filter(
                patient=appointment.patient
            )
            .exclude(
                pk=appointment.pk
            )
            .filter(
                Q(
                    appointment_date__lt=
                    appointment.appointment_date
                )
                |
                Q(
                    appointment_date=
                    appointment.appointment_date,
                    appointment_time__lt=
                    appointment.appointment_time
                )
            )
            .exclude(
                status="CANCELLED"
            )
            .exists()
        )

        if has_previous_appointment:
            registration_fee = Decimal("0.00")
        else:
            registration_fee = self.REGISTRATION_FEE

        total_amount = (
            consultation_fee
            + registration_fee
        )

        bill = Bill.objects.create(
            appointment=appointment,
            consultation_fee=consultation_fee,
            registration_fee=registration_fee,
            total_amount=total_amount,
            payment_status="PENDING",
        )

        return Response(
            BillSerializer(bill).data,
            status=status.HTTP_201_CREATED
        )

class BillDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get_object(self, bill_id):
        return get_object_or_404(
            Bill.objects.select_related(
                "appointment__patient",
                "appointment__doctor__staff__user",
                "appointment__department",
            ),
            pk=bill_id,
        )

    def get(self, request, bill_id):

        bill = self.get_object(bill_id)

        return Response(
            BillSerializer(bill).data
        )

    def patch(self, request, bill_id):

        bill = self.get_object(bill_id)

        payment_status = request.data.get(
            "payment_status"
        )
        payment_method = request.data.get(
            "payment_method"
        )

        if payment_status is not None:

            valid_statuses = {
                choice[0]
                for choice in Bill.PAYMENT_STATUS_CHOICES
            }

            if payment_status not in valid_statuses:
                return Response(
                    {
                        "detail":
                        "Invalid payment status."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            bill.payment_status = payment_status

        if payment_method is not None:

            valid_methods = {
                choice[0]
                for choice in Bill.PAYMENT_METHOD_CHOICES
            }

            if payment_method not in valid_methods:
                return Response(
                    {
                        "detail":
                        "Invalid payment method."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            bill.payment_method = payment_method

        bill.save()

        return Response(
            BillSerializer(bill).data
        )

class AppointmentListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get(self, request):

        appointment_date = request.query_params.get("date")
        status_filter = request.query_params.get("status")

        appointments = (
            Appointment.objects
            .select_related(
                "patient",
                "doctor__staff__user",
                "department",
            )
            .all()
        )

        if appointment_date:
            appointments = appointments.filter(
                appointment_date=appointment_date
            )

        if status_filter:
            appointments = appointments.filter(
                status=status_filter
            )

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

class AppointmentDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionist,
    ]

    def get_object(self, appointment_id):

        return get_object_or_404(
            Appointment.objects.select_related(
                "patient",
                "doctor__staff__user",
                "department",
            ),
            pk=appointment_id,
        )

    def get(self, request, appointment_id):

        appointment = self.get_object(
            appointment_id
        )

        return Response(
            AppointmentSerializer(
                appointment
            ).data
        )

    def patch(self, request, appointment_id):

        appointment = self.get_object(
            appointment_id
        )

        new_status = request.data.get("status")

        if new_status != "CANCELLED":
            return Response(
                {
                    "detail":
                    "Only cancellation is supported."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if appointment.status == "CANCELLED":
            return Response(
                {
                    "detail":
                    "Appointment is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = "CANCELLED"
        appointment.save()

        return Response(
            AppointmentSerializer(
                appointment
            ).data
        )