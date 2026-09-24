from rest_framework.permissions import BasePermission

from .models import Staff


class IsAdminUser(BasePermission):
    """
    Allows access only to the Django admin user.
    """

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Django superuser = Admin
        if request.user.is_superuser:
            return True

        return False