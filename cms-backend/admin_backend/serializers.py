from datetime import date

from rest_framework import serializers

from .models import Staff, Department, Medicine, LabTest


# Minimum age required to be added as staff, by role.
# Any role not listed here falls back to 18.
MIN_AGE_BY_ROLE = {
    "RECEPTIONIST": 18,
    "DOCTOR": 23,
    "PHARMACIST": 23,
    "LAB_TECHNICIAN": 18,
}


def calculate_age(date_of_birth):
    today = date.today()

    had_birthday_this_year = (
        (today.month, today.day)
        >= (date_of_birth.month, date_of_birth.day)
    )

    years = today.year - date_of_birth.year

    if not had_birthday_this_year:
        years -= 1

    return years


class StaffSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    age = serializers.ReadOnlyField()

    class Meta:
        model = Staff

        fields = [
            "staff_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "date_of_birth",
            "age",
            "address",
            "phone_number",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "staff_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "age",
            "created_at",
        ]


class StaffCreateSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)

    def validate_username(self, value):
        from django.contrib.auth.models import User

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    first_name = serializers.CharField(
        max_length=150,
        required=False
    )
    last_name = serializers.CharField(
        max_length=150,
        required=False
    )
    email = serializers.EmailField(
        required=True
    )
    password = serializers.CharField(
        write_only=True
    )
    role = serializers.ChoiceField(
        choices=Staff.ROLE_CHOICES
    )
    date_of_birth = serializers.DateField(
        required=True
    )
    address = serializers.CharField(
        required=True,
        allow_blank=False
    )
    phone_number = serializers.RegexField(
        regex=r"^\d{10}$",
        required=True,
        error_messages={
            "invalid": "Phone number must be exactly 10 digits."
        },
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        required=False
    )
    consultation_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )
    is_active = serializers.BooleanField(
        default=True
    )

    def validate_date_of_birth(self, value):

        if value >= date.today():
            raise serializers.ValidationError(
                "Date of birth must be in the past."
            )

        return value

    def validate(self, data):

        role = data.get("role")

        if role == "DOCTOR":

            if not data.get("department"):
                raise serializers.ValidationError({
                    "department": "Department is required for a Doctor."
                })

            if data.get("consultation_fee") is None:
                raise serializers.ValidationError({
                    "consultation_fee":
                    "Consultation Fee is required for a Doctor."
                })

        date_of_birth = data.get("date_of_birth")

        if date_of_birth:

            age = calculate_age(date_of_birth)

            min_age = MIN_AGE_BY_ROLE.get(role, 18)

            if age < min_age:
                raise serializers.ValidationError({
                    "date_of_birth": (
                        f"A {role.replace('_', ' ').title()} must be "
                        f"at least {min_age} years old. "
                        f"This staff member is {age}."
                    )
                })

        return data

class StaffUpdateSerializer(serializers.Serializer):

    first_name = serializers.CharField(
        max_length=150,
        required=False
    )

    last_name = serializers.CharField(
        max_length=150,
        required=False
    )

    email = serializers.EmailField(
        required=False
    )

    date_of_birth = serializers.DateField(
        required=False
    )

    address = serializers.CharField(
        required=False,
        allow_blank=False
    )

    phone_number = serializers.RegexField(
        regex=r"^\d{10}$",
        required=False,
        error_messages={
            "invalid": "Phone number must be exactly 10 digits."
        },
    )

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        required=False
    )

    consultation_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False
    )

    is_active = serializers.BooleanField(
        required=False
    )

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    def validate_date_of_birth(self, value):

        if value >= date.today():
            raise serializers.ValidationError(
                "Date of birth must be in the past."
            )

        return value

    def validate(self, data):

        staff = self.instance

        date_of_birth = data.get(
            "date_of_birth",
            staff.date_of_birth
        )

        if date_of_birth:

            age = calculate_age(date_of_birth)

            min_age = MIN_AGE_BY_ROLE.get(staff.role, 18)

            if age < min_age:
                raise serializers.ValidationError({
                    "date_of_birth": (
                        f"A {staff.role.replace('_', ' ').title()} must "
                        f"be at least {min_age} years old. "
                        f"This staff member is {age}."
                    )
                })

        if staff.role == "DOCTOR":

            department = data.get(
                "department",
                getattr(
                    getattr(staff, "doctor_profile", None),
                    "department",
                    None
                )
            )

            consultation_fee = data.get(
                "consultation_fee",
                getattr(
                    getattr(staff, "doctor_profile", None),
                    "consultation_fee",
                    None
                )
            )

            if not department:
                raise serializers.ValidationError({
                    "department":
                    "Department is required for a Doctor."
                })

            if consultation_fee is None:
                raise serializers.ValidationError({
                    "consultation_fee":
                    "Consultation Fee is required for a Doctor."
                })

        return data

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department

        fields = [
            "id",
            "name",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]   

class MedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine

        fields = [
            "id",
            "name",
            "generic_name",
            "brand_name",
            "formulation",
            "strength",
            "unit",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest

        fields = [
            "id",
            "test_code",
            "test_name",
            "category",
            "sample_type",
            "price",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]