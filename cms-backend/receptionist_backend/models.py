from django.db import models


class Patient(models.Model):

    GENDER_CHOICES = [
        ("MALE", "Male"),
        ("FEMALE", "Female"),
        ("OTHER", "Other"),
    ]

    BLOOD_GROUP_CHOICES = [
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
        ("O+", "O+"),
        ("O-", "O-"),
    ]

    patient_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
    )

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    phone = models.CharField(
        max_length=15
    )

    email = models.EmailField(
        blank=True
    )

    address = models.TextField()

    emergency_name = models.CharField(
        max_length=100,
        blank=True
    )

    emergency_phone = models.CharField(
        max_length=15,
        blank=True
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BLOOD_GROUP_CHOICES,
        blank=True
    )

    insurance = models.CharField(
        max_length=200,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.patient_id:

            last_patient = (
                Patient.objects
                .order_by("-id")
                .first()
            )

            if last_patient and last_patient.patient_id:

                last_number = int(
                    last_patient.patient_id.replace(
                        "PAT", ""
                    )
                )

                next_number = last_number + 1

            else:
                next_number = 1

            self.patient_id = (
                f"PAT{next_number:04d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.patient_id} - "
            f"{self.first_name} {self.last_name}"
        )

from django.core.exceptions import ValidationError


class DoctorAvailability(models.Model):

    DAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    doctor = models.ForeignKey(
        "admin_backend.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="receptionist_availabilities"
    )

    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_CHOICES
    )

    start_time = models.TimeField(
        default="09:00"
    )

    end_time = models.TimeField(
        default="16:00"
    )

    is_available = models.BooleanField(
        default=True
    )

    def clean(self):

        if self.start_time >= self.end_time:
            raise ValidationError(
                "Start time must be earlier than end time."
            )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "day_of_week"],
                name="unique_doctor_availability_per_day"
            )
        ]

    def __str__(self):
        return (
            f"{self.doctor} - "
            f"{self.get_day_of_week_display()} "
            f"{self.start_time} to {self.end_time}"
        )


class Appointment(models.Model):

    APPOINTMENT_TYPE_CHOICES = [
        ("PRIOR", "Prior Appointment"),
        ("CONSULTATION", "Consultation"),
    ]

    STATUS_CHOICES = [
            ("SCHEDULED", "Scheduled"),
            ("IN_CONSULTATION", "In Consultation"),
            ("CANCELLED", "Cancelled"),
            ("COMPLETED", "Completed"),
        ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="appointments"
    )

    doctor = models.ForeignKey(
        "admin_backend.DoctorProfile",
        on_delete=models.PROTECT,
        related_name="receptionist_appointments"
    )

    department = models.ForeignKey(
        "admin_backend.Department",
        on_delete=models.PROTECT,
        related_name="receptionist_appointments"
    )

    appointment_date = models.DateField()

    appointment_time = models.TimeField()

    token_number = models.PositiveIntegerField()

    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPE_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="SCHEDULED"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "appointment_date",
                    "appointment_time",
                ],
                condition=models.Q(status="SCHEDULED"),
                name="unique_active_doctor_appointment_slot",
            ),
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "appointment_date",
                    "token_number",
                ],
                condition=models.Q(status="SCHEDULED"),
                name="unique_active_doctor_daily_token",
            ),
        ]

        ordering = [
            "appointment_date",
            "appointment_time",
        ]

    def __str__(self):
        return (
            f"{self.patient.patient_id} - "
            f"{self.doctor} - "
            f"{self.appointment_date} "
            f"{self.appointment_time}"
        )

class Bill(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("CASH", "Cash"),
        ("CARD", "Card"),
        ("UPI", "UPI"),
        ("OTHER", "Other"),
    ]

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.PROTECT,
        related_name="bill"
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    registration_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
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

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"Bill #{self.id} - "
            f"{self.appointment.patient.patient_id}"
        )

