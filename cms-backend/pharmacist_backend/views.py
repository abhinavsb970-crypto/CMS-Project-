from decimal import Decimal

from django.db import transaction
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

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

from .serializers import (
    MedicineSerializer,
    StockHistorySerializer,
    PharmacyPatientSerializer,
    PharmacyPrescriptionSerializer,
    PrescriptionMedicineSerializer,
    IssuedPrescriptionSerializer,
    PharmacyBillSerializer,
    DoctorPrescriptionSerializer,
)


from .services.doctor_prescription_service import (
    get_doctor_prescriptions,
    get_doctor_prescription,
)


# =========================================================
# MEDICINE INVENTORY
# =========================================================

class MedicineListCreateView(
    generics.ListCreateAPIView
):

    queryset = Medicine.objects.all().order_by(
        "name"
    )

    serializer_class = MedicineSerializer


class MedicineDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Medicine.objects.all()

    serializer_class = MedicineSerializer


# =========================================================
# STOCK HISTORY
# =========================================================

class StockHistoryListView(
    generics.ListAPIView
):

    queryset = StockHistory.objects.select_related(
        "medicine"
    ).all()

    serializer_class = StockHistorySerializer


# =========================================================
# PHARMACY PATIENT
# =========================================================

class PharmacyPatientListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = PharmacyPatientSerializer

    def get_queryset(self):

        queryset = PharmacyPatient.objects.all().order_by(
            "name"
        )

        search = self.request.query_params.get(
            "search"
        )

        if search:

            queryset = queryset.filter(
                Q(
                    name__icontains=search
                )
                |
                Q(
                    patient_id__icontains=search
                )
            )

        return queryset


class PharmacyPatientDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = PharmacyPatient.objects.all()

    serializer_class = PharmacyPatientSerializer


# =========================================================
# PHARMACY PRESCRIPTIONS
# =========================================================

class PharmacyPrescriptionListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = PharmacyPrescriptionSerializer

    def get_queryset(self):

        queryset = (
            PharmacyPrescription.objects
            .select_related("patient")
            .prefetch_related("medicines")
            .all()
            .order_by("-created_at")
        )

        patient_id = self.request.query_params.get(
            "patient_id"
        )

        patient_name = self.request.query_params.get(
            "patient_name"
        )

        appointment_id = self.request.query_params.get(
            "appointment_id"
        )

        is_issued = self.request.query_params.get(
            "is_issued"
        )

        if patient_id:

            queryset = queryset.filter(
                patient__patient_id__icontains=patient_id
            )

        if patient_name:

            queryset = queryset.filter(
                patient__name__icontains=patient_name
            )

        if appointment_id:

            queryset = queryset.filter(
                appointment_id__icontains=appointment_id
            )

        if is_issued is not None:

            if is_issued.lower() == "true":

                queryset = queryset.filter(
                    is_issued=True
                )

            elif is_issued.lower() == "false":

                queryset = queryset.filter(
                    is_issued=False
                )

        return queryset


class PharmacyPrescriptionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = (
        PharmacyPrescription.objects
        .select_related("patient")
        .prefetch_related("medicines")
        .all()
    )

    serializer_class = PharmacyPrescriptionSerializer


# =========================================================
# PRESCRIPTION MEDICINES
# =========================================================

class PrescriptionMedicineCreateView(APIView):

    # =====================================================
    # GET PRESCRIPTION MEDICINES
    # =====================================================

    def get(
        self,
        request,
        prescription_id
    ):

        try:

            prescription = (
                PharmacyPrescription.objects.get(
                    id=prescription_id
                )
            )

        except PharmacyPrescription.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Prescription not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        medicines = (
            PrescriptionMedicine.objects
            .filter(
                prescription=prescription
            )
            .order_by("id")
        )

        serializer = (
            PrescriptionMedicineSerializer(
                medicines,
                many=True
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # =====================================================
    # ADD PRESCRIPTION MEDICINE
    # =====================================================

    def post(
        self,
        request,
        prescription_id
    ):

        try:

            prescription = (
                PharmacyPrescription.objects.get(
                    id=prescription_id
                )
            )

        except PharmacyPrescription.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Prescription not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if prescription.is_issued:

            return Response(
                {
                    "detail":
                    "Cannot add medicines. "
                    "This prescription is already issued."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = (
            PrescriptionMedicineSerializer(
                data=request.data
            )
        )

        if serializer.is_valid():

            serializer.save(
                prescription=prescription
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PrescriptionMedicineDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = PrescriptionMedicine.objects.all()

    serializer_class = PrescriptionMedicineSerializer


# =========================================================
# ISSUE MEDICINES
# =========================================================

class IssuePrescriptionView(
    APIView
):

    @transaction.atomic
    def post(
        self,
        request,
        prescription_id
    ):

        try:

            prescription = (
                PharmacyPrescription.objects
                .select_related("patient")
                .prefetch_related("medicines")
                .get(id=prescription_id)
            )

        except PharmacyPrescription.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Prescription not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if prescription.is_issued:

            return Response(
                {
                    "detail":
                    "This prescription has already "
                    "been issued."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        prescribed_medicines = (
            prescription.medicines.all()
        )

        if not prescribed_medicines.exists():

            return Response(
                {
                    "detail":
                    "No medicines found in this "
                    "prescription."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------------
        # FIRST CHECK STOCK FOR ALL MEDICINES
        # -----------------------------------------------

        medicine_records = []

        for prescribed_medicine in prescribed_medicines:

            try:

                medicine = (
                    Medicine.objects
                    .select_for_update()
                    .get(
                        name__iexact=
                        prescribed_medicine.medicine_name
                    )
                )

            except Medicine.DoesNotExist:

                return Response(
                    {
                        "detail":
                        f"Medicine "
                        f"'{prescribed_medicine.medicine_name}' "
                        f"is not available in inventory."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if medicine.stock < (
                prescribed_medicine.prescribed_quantity
            ):

                return Response(
                    {
                        "detail":
                        f"Insufficient stock for "
                        f"'{medicine.name}'. "
                        f"Available: {medicine.stock}, "
                        f"Required: "
                        f"{prescribed_medicine.prescribed_quantity}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            medicine_records.append(
                (
                    prescribed_medicine,
                    medicine
                )
            )

        # -----------------------------------------------
        # CREATE ISSUED PRESCRIPTION
        # -----------------------------------------------

        issued_prescription = (
            IssuedPrescription.objects.create(
                prescription=prescription
            )
        )

        # -----------------------------------------------
        # ISSUE MEDICINES AND REDUCE STOCK
        # -----------------------------------------------

        for (
            prescribed_medicine,
            medicine
        ) in medicine_records:

            issued_quantity = (
                prescribed_medicine
                .prescribed_quantity
            )

            IssuedMedicine.objects.create(
                issued_prescription=
                issued_prescription,

                medicine=medicine,

                medicine_name=medicine.name,

                issued_quantity=
                issued_quantity,

                price_at_issue=
                medicine.price,
            )

            # Reduces stock.
            # Medicine.save() automatically
            # creates Stock History.

            medicine.stock -= issued_quantity

            medicine.save()

        # -----------------------------------------------
        # MARK PRESCRIPTION AS ISSUED
        # -----------------------------------------------

        prescription.is_issued = True

        prescription.save()

        serializer = (
            IssuedPrescriptionSerializer(
                issued_prescription
            )
        )

        return Response(
            {
                "message":
                "Medicines issued successfully.",

                "issued_prescription":
                serializer.data,
            },
            status=status.HTTP_201_CREATED
        )


# =========================================================
# ISSUED PRESCRIPTIONS
# =========================================================

class IssuedPrescriptionListView(
    generics.ListAPIView
):

    queryset = (
        IssuedPrescription.objects
        .select_related(
            "prescription",
            "prescription__patient"
        )
        .prefetch_related(
            "medicines",
            "medicines__medicine"
        )
        .all()
        .order_by("-issued_at")
    )

    serializer_class = (
        IssuedPrescriptionSerializer
    )


class IssuedPrescriptionDetailView(
    generics.RetrieveAPIView
):

    queryset = (
        IssuedPrescription.objects
        .select_related(
            "prescription",
            "prescription__patient"
        )
        .prefetch_related(
            "medicines",
            "medicines__medicine"
        )
        .all()
    )

    serializer_class = (
        IssuedPrescriptionSerializer
    )


# =========================================================
# PHARMACY BILL
# =========================================================

class PharmacyBillListView(
    generics.ListAPIView
):

    queryset = (
        PharmacyBill.objects
        .select_related(
            "issued_prescription",
            "issued_prescription__prescription",
            "issued_prescription__prescription__patient"
        )
        .all()
        .order_by("-bill_date")
    )

    serializer_class = PharmacyBillSerializer


class GenerateBillView(
    APIView
):

    @transaction.atomic
    def post(
        self,
        request,
        issued_prescription_id
    ):

        try:

            issued_prescription = (
                IssuedPrescription.objects
                .select_related(
                    "prescription",
                    "prescription__patient"
                )
                .prefetch_related(
                    "medicines"
                )
                .get(
                    id=issued_prescription_id
                )
            )

        except IssuedPrescription.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Issued prescription not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -----------------------------------------------
        # PREVENT DUPLICATE BILL
        # -----------------------------------------------

        if hasattr(
            issued_prescription,
            "bill"
        ):

            return Response(
                {
                    "detail":
                    "Bill already generated for "
                    "this prescription."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------------
        # PAYMENT METHOD
        # -----------------------------------------------

        payment_method = request.data.get(
            "payment_method"
        )

        allowed_payment_methods = [
            "Cash",
            "Card",
            "UPI",
        ]

        if payment_method not in (
            allowed_payment_methods
        ):

            return Response(
                {
                    "detail":
                    "Invalid payment method. "
                    "Use Cash, Card, or UPI."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------------
        # CALCULATE TOTAL
        # -----------------------------------------------

        total_amount = Decimal("0.00")

        for issued_medicine in (
            issued_prescription.medicines.all()
        ):

            medicine_total = (
                issued_medicine.price_at_issue
                *
                issued_medicine.issued_quantity
            )

            total_amount += medicine_total

        # -----------------------------------------------
        # GENERATE BILL NUMBER
        # -----------------------------------------------

        bill_number = (
            f"PH-BILL-"
            f"{issued_prescription.id:05d}"
        )

        # -----------------------------------------------
        # CREATE BILL
        # -----------------------------------------------

        bill = PharmacyBill.objects.create(
            issued_prescription=
            issued_prescription,

            bill_number=bill_number,

            total_amount=total_amount,

            payment_method=
            payment_method,
        )

        serializer = PharmacyBillSerializer(
            bill
        )

        return Response(
            {
                "message":
                "Bill generated successfully.",

                "bill":
                serializer.data,
            },
            status=status.HTTP_201_CREATED
        )

# =========================================================
# DOCTOR PRESCRIPTIONS
# READ-ONLY CONNECTION FROM DOCTOR MODULE
# =========================================================

class DoctorPrescriptionListView(generics.ListAPIView):

    serializer_class = DoctorPrescriptionSerializer

    def get_queryset(self):
        queryset = get_doctor_prescriptions()

        patient_id = self.request.query_params.get("patient_id")
        patient_name = self.request.query_params.get("patient_name")
        consultation_id = self.request.query_params.get("consultation_id")

        if patient_id:
            queryset = queryset.filter(
                appointment__patient__patient_id__icontains=patient_id
            )

        if patient_name:
            queryset = queryset.filter(
                appointment__patient__first_name__icontains=patient_name
            ) | queryset.filter(
                appointment__patient__last_name__icontains=patient_name
            )

        if consultation_id:
            queryset = queryset.filter(id=consultation_id)

        return queryset.distinct()


class DoctorPrescriptionDetailView(generics.RetrieveAPIView):

    serializer_class = DoctorPrescriptionSerializer

    def get_queryset(self):
        return get_doctor_prescriptions()
