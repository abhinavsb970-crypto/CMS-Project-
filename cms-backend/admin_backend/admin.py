from django.contrib import admin
from django.contrib.auth.models import User

from .models import Department, Staff, Medicine, LabTest
from .forms import StaffAdminForm


# =====================================================
# DEPARTMENT ADMIN
# =====================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )


# =====================================================
# STAFF ADMIN
# =====================================================

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):

    form = StaffAdminForm

    list_display = (
        "staff_id",
        "staff_name",
        "role",
        "is_active",
        "created_at",
    )

    list_filter = (
        "role",
        "is_active",
    )

    search_fields = (
        "staff_id",
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__email",
    )

    readonly_fields = (
        "staff_id",
    )

    def staff_name(self, obj):

        return obj.user.get_full_name()

    staff_name.short_description = "Name"

    def save_model(
        self,
        request,
        obj,
        form,
        change
    ):

        form.save_all(obj)


# =====================================================
# REMOVE DEFAULT USER ADMIN
# =====================================================

try:

    admin.site.unregister(User)

except admin.sites.NotRegistered:

    pass
# =====================================================
# MEDICINE MASTER
# =====================================================

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "generic_name",
        "brand_name",
        "formulation",
        "strength",
        "unit",
        "is_active",
        "created_at",
    )

    list_filter = (
        "formulation",
        "is_active",
    )

    search_fields = (
        "name",
        "generic_name",
        "brand_name",
    )

    ordering = (
        "name",
    )

# =====================================================
# LAB TEST MASTER
# =====================================================

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):

    list_display = (
        "test_code",
        "test_name",
        "category",
        "sample_type",
        "price",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "sample_type",
        "is_active",
    )

    search_fields = (
        "test_code",
        "test_name",
        "category",
    )

    ordering = (
        "test_name",
    )    