from rest_framework.permissions import BasePermission


class IsDoctor(BasePermission):
    """
    Allows access only to authenticated users
    who have a DoctorProfile.
    """

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        return hasattr(request.user, "staff_profile") and \
               hasattr(request.user.staff_profile, "doctor_profile")