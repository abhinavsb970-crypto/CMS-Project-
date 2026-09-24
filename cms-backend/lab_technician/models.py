from django.db import models
from admin_backend.models import LabTest, Staff


class LabTestRequest(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SAMPLE_COLLECTED", "Sample Collected"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    request_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    # ---------------------------------------------------------
    # Doctor prescription which created this lab request
    # ---------------------------------------------------------
    doctor_prescription = models.OneToOneField(
        "doctor_backend.PrescribedLabTest",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="lab_test_request"
    )

    # Existing patient and doctor references
    # These are kept for compatibility with the existing Lab module.
    patient_id = models.IntegerField()
    doctor_id = models.IntegerField(
        null=True,
        blank=True
    )

    lab_test = models.ForeignKey(
        LabTest,
        on_delete=models.PROTECT,
        related_name="test_requests"
    )

    assigned_technician = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lab_test_requests"
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    requested_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.request_id:

            last_request = LabTestRequest.objects.order_by("-id").first()

            if last_request:
                next_number = last_request.id + 1
            else:
                next_number = 1

            self.request_id = f"REQ{next_number:05d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.request_id} - {self.lab_test.test_name}"


class LabResult(models.Model):

    request = models.OneToOneField(
        LabTestRequest,
        on_delete=models.CASCADE,
        related_name="result_record"
    )

    result = models.TextField()

    remarks = models.TextField(
        blank=True
    )

    entered_by = models.ForeignKey(
        Staff,
        on_delete=models.PROTECT,
        related_name="lab_results"
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Result - {self.request.request_id}"


class LaboratoryReport(models.Model):

    report_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    request = models.OneToOneField(
        LabTestRequest,
        on_delete=models.PROTECT,
        related_name="laboratory_report"
    )

    result = models.OneToOneField(
        LabResult,
        on_delete=models.PROTECT,
        related_name="laboratory_report"
    )

    generated_by = models.ForeignKey(
        Staff,
        on_delete=models.PROTECT,
        related_name="generated_lab_reports"
    )

    generated_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        if not self.report_id:

            last_report = LaboratoryReport.objects.order_by("-id").first()

            if last_report:
                next_number = last_report.id + 1
            else:
                next_number = 1

            self.report_id = f"RPT{next_number:05d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_id} - {self.request.request_id}"


class LaboratoryBill(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("CASH", "Cash"),
        ("CARD", "Card"),
        ("UPI", "UPI"),
        ("ONLINE", "Online"),
    ]

    bill_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    report = models.OneToOneField(
        LaboratoryReport,
        on_delete=models.PROTECT,
        related_name="laboratory_bill"
    )

    patient_id = models.IntegerField()

    test_name = models.CharField(
        max_length=200
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="PENDING"
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.bill_id:

            last_bill = LaboratoryBill.objects.order_by("-id").first()

            if last_bill:
                next_number = last_bill.id + 1
            else:
                next_number = 1

            self.bill_id = f"BILL{next_number:05d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bill_id} - Patient {self.patient_id}"