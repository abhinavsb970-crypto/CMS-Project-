from django import forms
from django.contrib.auth.models import User
from django.db import transaction

from .models import Staff, Department, DoctorProfile


# =====================================================
# STAFF ID PREFIX
# =====================================================

ROLE_PREFIXES = {
    "DOCTOR": "DOC",
    "RECEPTIONIST": "REC",
    "PHARMACIST": "PHA",
    "LAB_TECHNICIAN": "LAB",
}


# =====================================================
# GENERATE STAFF ID
# =====================================================

def generate_staff_id(role):

    prefix = ROLE_PREFIXES[role]

    existing_ids = Staff.objects.filter(
        staff_id__startswith=prefix
    ).values_list("staff_id", flat=True)

    highest_number = 0

    for staff_id in existing_ids:

        try:
            number = int(staff_id[len(prefix):])

            if number > highest_number:
                highest_number = number

        except ValueError:
            continue

    next_number = highest_number + 1

    return f"{prefix}{next_number:03d}"


# =====================================================
# STAFF ADMIN FORM
# =====================================================

from django import forms
from django.contrib.auth.models import User
from django.db import transaction

from .models import Staff, Department, DoctorProfile


ROLE_PREFIXES = {
    "DOCTOR": "DOC",
    "RECEPTIONIST": "REC",
    "PHARMACIST": "PHA",
    "LAB_TECHNICIAN": "LAB",
}


def generate_staff_id(role):
    prefix = ROLE_PREFIXES[role]

    existing_ids = Staff.objects.filter(
        staff_id__startswith=prefix
    ).values_list("staff_id", flat=True)

    numbers = []

    for staff_id in existing_ids:
        try:
            numbers.append(int(staff_id.replace(prefix, "")))
        except ValueError:
            pass

    next_number = max(numbers, default=0) + 1

    return f"{prefix}{next_number:03d}"


class StaffAdminForm(forms.ModelForm):

    staff_id = forms.CharField(
        required=False,
        disabled=True,
        label="Staff ID"
    )

    username = forms.CharField(
        max_length=150
    )

    first_name = forms.CharField(
        max_length=150,
        required=False
    )

    last_name = forms.CharField(
        max_length=150,
        required=False
    )

    email = forms.EmailField(
        required=False
    )

    password = forms.CharField(
        widget=forms.PasswordInput,
        required=False
    )

    confirm_password = forms.CharField(
        widget=forms.PasswordInput,
        required=False
    )

    department = forms.ModelChoiceField(
        queryset=Department.objects.filter(is_active=True),
        required=False
    )

    consultation_fee = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )

    class Meta:
        model = Staff

        fields = [
            "staff_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "password",
            "confirm_password",
            "department",
            "consultation_fee",
            "is_active",
        ]

    def __init__(self, *args, **kwargs):

        super().__init__(*args, **kwargs)

        # Editing an existing staff member
        if self.instance and self.instance.pk:

            user = self.instance.user

            self.fields["username"].initial = user.username
            self.fields["first_name"].initial = user.first_name
            self.fields["last_name"].initial = user.last_name
            self.fields["email"].initial = user.email

            self.fields["staff_id"].initial = self.instance.staff_id

            # Doctor-specific information
            if self.instance.role == "DOCTOR":

                try:
                    doctor = self.instance.doctor_profile

                    self.fields["department"].initial = doctor.department
                    self.fields["consultation_fee"].initial = (
                        doctor.consultation_fee
                    )

                except DoctorProfile.DoesNotExist:
                    pass

            else:
                # Hide doctor-specific fields for non-doctors
                self.fields.pop("department")
                self.fields.pop("consultation_fee")

            # Password is optional while editing
            self.fields["password"].required = False
            self.fields["confirm_password"].required = False

            # Do not allow changing role after creation
            self.fields["role"].disabled = True

        else:

            # New staff member
            self.fields["staff_id"].initial = "Auto Generated"

    def clean(self):

        cleaned_data = super().clean()

        role = cleaned_data.get("role")

        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        # Password confirmation
        if password or confirm_password:

            if password != confirm_password:
                raise forms.ValidationError(
                    "Password and Confirm Password must match."
                )

        # Doctor-specific validation
        if role == "DOCTOR":

            department = cleaned_data.get("department")
            consultation_fee = cleaned_data.get("consultation_fee")

            if not department:
                self.add_error(
                    "department",
                    "Department is required for a Doctor."
                )

            if consultation_fee is None:
                self.add_error(
                    "consultation_fee",
                    "Consultation Fee is required for a Doctor."
                )

        return cleaned_data

    def save_all(self, staff):

        with transaction.atomic():

            # --------------------------------
            # CREATE
            # --------------------------------

            if not staff.pk:

                username = self.cleaned_data["username"]
                password = self.cleaned_data["password"]

                user = User.objects.create_user(
                    username=username,
                    password=password,
                    first_name=self.cleaned_data.get("first_name", ""),
                    last_name=self.cleaned_data.get("last_name", ""),
                    email=self.cleaned_data.get("email", ""),
                )

                staff.user = user

                staff.role = self.cleaned_data["role"]

                staff.staff_id = generate_staff_id(
                    staff.role
                )

                staff.save()

            # --------------------------------
            # UPDATE
            # --------------------------------

            else:

                user = staff.user

                user.username = self.cleaned_data["username"]
                user.first_name = self.cleaned_data.get(
                    "first_name", ""
                )
                user.last_name = self.cleaned_data.get(
                    "last_name", ""
                )
                user.email = self.cleaned_data.get(
                    "email", ""
                )

                password = self.cleaned_data.get("password")

                if password:
                    user.set_password(password)

                user.save()

                staff.is_active = self.cleaned_data["is_active"]

                staff.save()

            # --------------------------------
            # DOCTOR PROFILE
            # --------------------------------

            if staff.role == "DOCTOR":

                DoctorProfile.objects.update_or_create(
                    staff=staff,
                    defaults={
                        "department": self.cleaned_data["department"],
                        "consultation_fee": self.cleaned_data[
                            "consultation_fee"
                        ],
                    }
                )

            else:

                # Make sure non-doctors never have
                # a DoctorProfile

                DoctorProfile.objects.filter(
                    staff=staff
                ).delete()

        return staff

    def save(self, commit=True):

        staff = super().save(commit=False)

        if commit:
            self.save_all(staff)

        return staff

    # =================================================
    # INITIALIZE FORM
    # =================================================

    def __init__(self, *args, **kwargs):

        super().__init__(*args, **kwargs)

        # ---------------------------------------------
        # Editing existing staff
        # ---------------------------------------------

        if self.instance and self.instance.pk:

            user = self.instance.user

            self.fields["staff_id"].initial = (
                self.instance.staff_id
            )

            self.fields["username"].initial = (
                user.username
            )

            self.fields["first_name"].initial = (
                user.first_name
            )

            self.fields["last_name"].initial = (
                user.last_name
            )

            self.fields["email"].initial = (
                user.email
            )

            # Password is optional when editing
            self.fields["password"].required = False
            self.fields["confirm_password"].required = False

            # Do not allow role changes for now
            self.fields["role"].disabled = True

            # Load doctor information
            if self.instance.role == "DOCTOR":

                try:

                    doctor_profile = (
                        self.instance.doctor_profile
                    )

                    self.fields["department"].initial = (
                        doctor_profile.department
                    )

                    self.fields["consultation_fee"].initial = (
                        doctor_profile.consultation_fee
                    )

                except DoctorProfile.DoesNotExist:

                    pass

    # =================================================
    # VALIDATION
    # =================================================

    def clean(self):

        cleaned_data = super().clean()

        username = cleaned_data.get("username")
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get(
            "confirm_password"
        )

        role = cleaned_data.get("role")

        department = cleaned_data.get(
            "department"
        )

        consultation_fee = cleaned_data.get(
            "consultation_fee"
        )

        # ---------------------------------------------
        # Username
        # ---------------------------------------------

        if username:

            existing_users = User.objects.filter(
                username=username
            )

            if self.instance and self.instance.pk:

                existing_users = existing_users.exclude(
                    pk=self.instance.user.pk
                )

            if existing_users.exists():

                self.add_error(
                    "username",
                    "This username is already in use."
                )

        # ---------------------------------------------
        # Password
        # ---------------------------------------------

        if password or confirm_password:

            if password != confirm_password:

                self.add_error(
                    "confirm_password",
                    "Passwords do not match."
                )

        # ---------------------------------------------
        # Doctor
        # ---------------------------------------------

        if role == "DOCTOR":

            if not department:

                self.add_error(
                    "department",
                    "Department is required for a Doctor."
                )

            if consultation_fee is None:

                self.add_error(
                    "consultation_fee",
                    "Consultation fee is required for a Doctor."
                )

        # ---------------------------------------------
        # Other roles
        # ---------------------------------------------

        else:

            cleaned_data["department"] = None

            cleaned_data["consultation_fee"] = None

        return cleaned_data

    # =================================================
    # SAVE ALL DATA
    # =================================================

    def save_all(self, staff):

        with transaction.atomic():

            username = self.cleaned_data["username"]
            first_name = self.cleaned_data["first_name"]
            last_name = self.cleaned_data["last_name"]
            email = self.cleaned_data["email"]

            password = self.cleaned_data.get(
                "password"
            )

            role = self.cleaned_data["role"]

            department = self.cleaned_data.get(
                "department"
            )

            consultation_fee = (
                self.cleaned_data.get(
                    "consultation_fee"
                )
            )

            # =========================================
            # CREATE NEW STAFF
            # =========================================

            if not staff.pk:

                user = User.objects.create_user(
                    username=username,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    is_active=staff.is_active,
                )

                staff.user = user

                staff.staff_id = generate_staff_id(
                    role
                )

                staff.save()

            # =========================================
            # UPDATE EXISTING STAFF
            # =========================================

            else:

                user = staff.user

                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.is_active = staff.is_active

                if password:

                    user.set_password(password)

                user.save()

                staff.save()

            # =========================================
            # DOCTOR PROFILE
            # =========================================

            if role == "DOCTOR":

                DoctorProfile.objects.update_or_create(
                    staff=staff,
                    defaults={
                        "department": department,
                        "consultation_fee": consultation_fee,
                    }
                )

            else:

                DoctorProfile.objects.filter(
                    staff=staff
                ).delete()

        return staff

    # =================================================
    # MODEL FORM SAVE
    # =================================================

    def save(self, commit=True):

        staff = super().save(commit=False)

        if commit:

            self.save_all(staff)

        return staff