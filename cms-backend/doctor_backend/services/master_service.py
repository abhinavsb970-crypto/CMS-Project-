from admin_backend.models import Medicine, LabTest


def get_active_medicines():
    return Medicine.objects.filter(
        is_active=True
    ).order_by("name")


def get_active_lab_tests():
    return LabTest.objects.filter(
        is_active=True
    ).order_by("test_name")