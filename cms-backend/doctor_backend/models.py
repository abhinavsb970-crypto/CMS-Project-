from django.db import models


class Consultation(models.Model):

    appointment = models.OneToOneField(
        "receptionist_backend.Appointment",
        on_delete=models.PROTECT,
        related_name="consultation"
    )

    symptoms = models.TextField()
    diagnosis = models.TextField()
    doctor_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation - {self.appointment}"

class PrescribedMedicine(models.Model):

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="prescribed_medicines"
    )

    medicine = models.ForeignKey(
        "admin_backend.Medicine",
        on_delete=models.PROTECT,
        related_name="prescriptions"
    )

    frequency = models.CharField(max_length=20)
    duration = models.PositiveIntegerField()
    instructions = models.CharField(max_length=50)
    route = models.CharField(max_length=30)
    quantity = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["consultation", "medicine"],
                name="unique_medicine_per_consultation"
            )
        ]

class PrescribedLabTest(models.Model):

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="prescribed_lab_tests"
    )

    lab_test = models.ForeignKey(
        "admin_backend.LabTest",
        on_delete=models.PROTECT,
        related_name="prescriptions"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["consultation", "lab_test"],
                name="unique_lab_test_per_consultation"
            )
        ]