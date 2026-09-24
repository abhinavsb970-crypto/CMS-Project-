from rest_framework.permissions import BasePermission


class IsReceptionist(BasePermission):
    """
    Allows access only to authenticated Receptionist staff.
    """

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return False

        try:
            staff = request.user.staff_profile
        except Exception:
            return False

        return (
            staff.role == "RECEPTIONIST"
            and staff.is_active
        )
