from datetime import date

from django.core.validators import RegexValidator
from django.db import models
from django.contrib.auth.models import User


phone_regex = RegexValidator(
    regex=r"^\d{10}$",
    message="Phone number must be exactly 10 digits.",
)


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Staff(models.Model):

    ROLE_CHOICES = [
        ("DOCTOR", "Doctor"),
        ("RECEPTIONIST", "Receptionist"),
        ("PHARMACIST", "Pharmacist"),
        ("LAB_TECHNICIAN", "Lab Technician"),
    ]

    staff_id = models.CharField(
        max_length=20,
        unique=True
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile"
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    phone_number = models.CharField(
        max_length=10,
        blank=True,
        validators=[phone_regex]
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def age(self):
        """
        Age is calculated from date_of_birth rather than
        stored directly, so it's always accurate and never
        goes stale.
        """

        if not self.date_of_birth:
            return None

        today = date.today()

        had_birthday_this_year = (
            (today.month, today.day)
            >= (self.date_of_birth.month, self.date_of_birth.day)
        )

        years = today.year - self.date_of_birth.year

        if not had_birthday_this_year:
            years -= 1

        return years

    def save(self, *args, **kwargs):

        if not self.staff_id:

            prefixes = {
                "DOCTOR": "DOC",
                "RECEPTIONIST": "REC",
                "PHARMACIST": "PHA",
                "LAB_TECHNICIAN": "LAB",
            }

            prefix = prefixes.get(self.role, "STF")

            last_staff = (
                Staff.objects
                .filter(staff_id__startswith=prefix)
                .order_by("-staff_id")
                .first()
            )

            if last_staff:
                last_number = int(
                    last_staff.staff_id[len(prefix):]
                )
                next_number = last_number + 1
            else:
                next_number = 1

            self.staff_id = f"{prefix}{next_number:03d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.staff_id} - {self.user.get_full_name()}"


class DoctorProfile(models.Model):
    staff = models.OneToOneField(
        Staff,
        on_delete=models.CASCADE,
        related_name="doctor_profile"
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="doctors"
    )
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.department.name}"


class Medicine(models.Model):

    name = models.CharField(
        max_length=200,
        unique=True
    )

    generic_name = models.CharField(
        max_length=200,
        blank=True
    )

    brand_name = models.CharField(
        max_length=200,
        blank=True
    )

    formulation = models.CharField(
        max_length=100
    )

    strength = models.CharField(
        max_length=100,
        blank=True
    )

    unit = models.CharField(
        max_length=50,
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

    class Meta:
        verbose_name = "Medicine Master"
        verbose_name_plural = "Medicine Master"

    def __str__(self):
        return f"{self.name} - {self.strength}"


class LabTest(models.Model):
    test_code = models.CharField(
        max_length=30,
        unique=True
    )
    test_name = models.CharField(
        max_length=200
    )

    # Temporary: nullable while existing LabTest records are migrated
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="lab_tests",
        null=True,
        blank=True
    )

    # Temporary field. Will be removed after existing data is mapped.
    category = models.CharField(
        max_length=100,
        blank=True
    )

    sample_type = models.CharField(
        max_length=100,
        blank=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
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

    class Meta:
        verbose_name = "Lab Master"
        verbose_name_plural = "Lab Master"

    def __str__(self):
        return f"{self.test_code} - {self.test_name}"