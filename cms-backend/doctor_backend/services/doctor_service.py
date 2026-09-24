from django.core.exceptions import PermissionDenied

from admin_backend.models import DoctorProfile


def get_current_doctor(user):
    """
    Return the DoctorProfile belonging to the logged-in user.
    """

    if not user or not user.is_authenticated:
        raise PermissionDenied("Authentication required.")

    try:
        return DoctorProfile.objects.select_related(
            "staff",
            "staff__user",
            "department"
        ).get(
            staff__user=user
        )

    except DoctorProfile.DoesNotExist:
        raise PermissionDenied(
            "Only doctors can access this resource."
        )