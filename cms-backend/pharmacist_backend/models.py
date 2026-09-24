from django.db import models


# =========================================================
# MEDICINE
# =========================================================

class Medicine(models.Model):

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
        ("Expired", "Expired"),
    ]

    name = models.CharField(
        max_length=200
    )

    medicine_type = models.CharField(
        max_length=100
    )

    batch_no = models.CharField(
        max_length=100,
        unique=True
    )

    manufacture_date = models.DateField()

    expiry_date = models.DateField()

    stock = models.PositiveIntegerField(
        default=0
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active"
    )

    # =====================================================
    # CONNECTION TO ADMIN MEDICINE MASTER
    # =====================================================

    master_medicine = models.ForeignKey(
        "admin_backend.Medicine",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="pharmacy_inventory"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        # Check whether this is a new medicine
        is_new = self.pk is None

        previous_stock = 0
        stock_changed = False

        # ==========================================
        # EXISTING MEDICINE
        # ==========================================

        if not is_new:

            try:

                old_medicine = Medicine.objects.get(
                    pk=self.pk
                )

                previous_stock = old_medicine.stock

                if previous_stock != self.stock:

                    stock_changed = True

            except Medicine.DoesNotExist:

                pass

        # ==========================================
        # SAVE MEDICINE
        # ==========================================

        super().save(*args, **kwargs)

        # ==========================================
        # NEW MEDICINE → CREATE INITIAL STOCK HISTORY
        # ==========================================

        if is_new:

            if self.stock > 0:

                StockHistory.objects.create(

                    medicine=self,

                    previous_stock=0,

                    new_stock=self.stock,

                    change=self.stock,

                    transaction_type="Stock In",

                )

        # ==========================================
        # EXISTING MEDICINE → CREATE STOCK HISTORY
        # ==========================================

        elif stock_changed:

            change = self.stock - previous_stock

            transaction_type = (

                "Stock In"

                if change > 0

                else "Stock Out"

            )

            StockHistory.objects.create(

                medicine=self,

                previous_stock=previous_stock,

                new_stock=self.stock,

                change=change,

                transaction_type=transaction_type,

            )

    def __str__(self):

        return self.name


# =========================================================
# STOCK HISTORY
# =========================================================

class StockHistory(models.Model):

    TRANSACTION_CHOICES = [
        ("Stock In", "Stock In"),
        ("Stock Out", "Stock Out"),
    ]

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="stock_history"
    )

    previous_stock = models.IntegerField()

    new_stock = models.IntegerField()

    change = models.IntegerField()

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_CHOICES,
        default="Stock In"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = [
            "-created_at"
        ]

    def __str__(self):

        return (
            f"{self.medicine.name} | "
            f"{self.transaction_type} | "
            f"{self.change}"
        )


# =========================================================
# PHARMACY PATIENT
# TEMPORARY UNTIL RECEPTIONIST/DOCTOR MODULE IS CONNECTED
# =========================================================

class PharmacyPatient(models.Model):

    patient_id = models.CharField(
        max_length=50,
        unique=True
    )

    name = models.CharField(
        max_length=200
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.patient_id} - "
            f"{self.name}"
        )


# =========================================================
# PHARMACY PRESCRIPTION
# TEMPORARY DUMMY DATA
# OLD DATA WILL CONTINUE TO WORK
# =========================================================

class PharmacyPrescription(models.Model):

    patient = models.ForeignKey(
        PharmacyPatient,
        on_delete=models.CASCADE,
        related_name="prescriptions"
    )

    appointment_id = models.CharField(
        max_length=100
    )

    appointment_date = models.DateField()

    doctor_name = models.CharField(
        max_length=200
    )

    is_issued = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.patient.name} | "
            f"{self.appointment_id}"
        )


# =========================================================
# PRESCRIBED MEDICINES
# OLD PHARMACY PRESCRIPTION DATA
# =========================================================

class PrescriptionMedicine(models.Model):

    prescription = models.ForeignKey(
        PharmacyPrescription,
        on_delete=models.CASCADE,
        related_name="medicines"
    )

    medicine_name = models.CharField(
        max_length=200
    )

    dosage = models.CharField(
        max_length=100
    )

    duration = models.CharField(
        max_length=100
    )

    prescribed_quantity = models.PositiveIntegerField()

    def __str__(self):

        return (
            f"{self.medicine_name} | "
            f"{self.prescribed_quantity}"
        )


# =========================================================
# ISSUED PRESCRIPTION
# CREATED WHEN PHARMACIST ISSUES MEDICINES
# =========================================================

class IssuedPrescription(models.Model):

    # -----------------------------------------------------
    # OLD PHARMACY PRESCRIPTION CONNECTION
    # KEPT FOR EXISTING DATA / BACKWARD COMPATIBILITY
    # -----------------------------------------------------

    prescription = models.OneToOneField(
        PharmacyPrescription,
        on_delete=models.CASCADE,
        related_name="issued_prescription",
        null=True,
        blank=True
    )

    # -----------------------------------------------------
    # NEW DOCTOR CONSULTATION CONNECTION
    # THIS IS THE REAL DOCTOR → PHARMACIST CONNECTION
    # -----------------------------------------------------

    consultation = models.OneToOneField(
        "doctor_backend.Consultation",
        on_delete=models.PROTECT,
        related_name="pharmacy_issued_prescription",
        null=True,
        blank=True
    )

    issued_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        if self.consultation:

            return (
                f"Issued Prescription | "
                f"Consultation {self.consultation.id}"
            )

        if self.prescription:

            return (
                f"Issued Prescription | "
                f"{self.prescription.patient.name}"
            )

        return "Issued Prescription"


# =========================================================
# ISSUED MEDICINE
# =========================================================

class IssuedMedicine(models.Model):

    issued_prescription = models.ForeignKey(
        IssuedPrescription,
        on_delete=models.CASCADE,
        related_name="medicines"
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT
    )

    medicine_name = models.CharField(
        max_length=200
    )

    issued_quantity = models.PositiveIntegerField()

    price_at_issue = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):

        return (
            f"{self.medicine_name} | "
            f"{self.issued_quantity}"
        )


# =========================================================
# PHARMACY BILL
# =========================================================

class PharmacyBill(models.Model):

    PAYMENT_CHOICES = [
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("UPI", "UPI"),
    ]

    issued_prescription = models.OneToOneField(
        IssuedPrescription,
        on_delete=models.PROTECT,
        related_name="bill"
    )

    bill_number = models.CharField(
        max_length=100,
        unique=True
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES
    )

    bill_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.bill_number} | "
            f"{self.total_amount}"
        )