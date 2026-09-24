from rest_framework.permissions import BasePermission


class IsLabTechnician(BasePermission):
    """
    Allows access only to active Lab Technician users.
    """

    message = "Only active Lab Technicians are allowed to access this resource."

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        try:
            staff = request.user.staff_profile
        except Exception:
            return False

        return (
            staff.is_active
            and staff.role == "LAB_TECHNICIAN"
        )