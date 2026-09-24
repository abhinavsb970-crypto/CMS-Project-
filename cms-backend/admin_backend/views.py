from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .models import Staff, Department, Medicine, LabTest, DoctorProfile
from .permissions import IsAdminUser
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
)

from .serializers import (
    StaffSerializer,
    StaffCreateSerializer,
    StaffUpdateSerializer,
    DepartmentSerializer,
    MedicineSerializer,
    LabTestSerializer,
)


class LoginView(TokenObtainPairView):
    pass
class RefreshTokenView(TokenRefreshView):
    pass


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # Admin
        if user.is_superuser:

            return Response({
                "username": user.username,
                "staff_id": None,
                "role": "ADMIN",
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            })

        # Staff user
        try:

            staff = Staff.objects.select_related(
                "user"
            ).get(user=user)

        except Staff.DoesNotExist:

            return Response(
                {
                    "detail": "Staff profile not found."
                },
                status=404
            )

        return Response({
            "username": user.username,
            "staff_id": staff.staff_id,
            "role": staff.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        })


class AdminTestView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get(self, request):

        return Response({
            "message": "You have Admin access."
        })
    
class StaffListView(ListAPIView):

    queryset = Staff.objects.select_related("user").all()

    serializer_class = StaffSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

class StaffCreateView(CreateAPIView):

    queryset = Staff.objects.all()

    serializer_class = StaffCreateSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def perform_create(self, serializer):

        data = serializer.validated_data

        with transaction.atomic():

            user = User.objects.create_user(
                username=data["username"],
                password=data["password"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                email=data.get("email", ""),
            )

            staff = Staff.objects.create(
                user=user,
                role=data["role"],
                date_of_birth=data["date_of_birth"],
                address=data["address"],
                phone_number=data["phone_number"],
                is_active=data.get("is_active", True),
            )

            if data["role"] == "DOCTOR":

                DoctorProfile.objects.create(
                    staff=staff,
                    department=data["department"],
                    consultation_fee=data["consultation_fee"],
                )

class StaffDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get_object(self, staff_id):

        return get_object_or_404(
            Staff.objects.select_related("user"),
            staff_id=staff_id
        )

    def get(self, request, staff_id):

        staff = self.get_object(staff_id)

        serializer = StaffSerializer(staff)

        return Response(serializer.data)

    def patch(self, request, staff_id):

        staff = self.get_object(staff_id)

        serializer = StaffUpdateSerializer(
            staff,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        with transaction.atomic():

            user = staff.user

            # Update personal information
            if "first_name" in data:
                user.first_name = data["first_name"]

            if "last_name" in data:
                user.last_name = data["last_name"]

            if "email" in data:
                user.email = data["email"]

            if "date_of_birth" in data:
                staff.date_of_birth = data["date_of_birth"]

            if "address" in data:
                staff.address = data["address"]

            if "phone_number" in data:
                staff.phone_number = data["phone_number"]

            # Update password
            if "password" in data:
                user.set_password(
                    data["password"]
                )

            # Update active/inactive status
            if "is_active" in data:

                staff.is_active = data["is_active"]

                user.is_active = data["is_active"]

            user.save()
            staff.save()

            # Update Doctor information
            if staff.role == "DOCTOR":

                doctor = get_object_or_404(
                    DoctorProfile,
                    staff=staff
                )

                if "department" in data:
                    doctor.department = data["department"]

                if "consultation_fee" in data:
                    doctor.consultation_fee = (
                        data["consultation_fee"]
                    )

                doctor.save()

        return Response(
            StaffSerializer(staff).data
        )

class DoctorListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        department_id = request.query_params.get("department")

        doctors = (
            DoctorProfile.objects
            .select_related(
                "staff__user",
                "department",
            )
            .filter(
                staff__is_active=True,
            )
            .order_by(
                "staff__user__first_name",
                "staff__user__last_name",
            )
        )

        if department_id:
            doctors = doctors.filter(
                department_id=department_id
            )

        data = []

        for doctor in doctors:
            data.append({
                "id": doctor.id,
                "staff_id": doctor.staff.staff_id,
                "name": doctor.staff.user.get_full_name(),
                "department": doctor.department.id,
                "department_name": doctor.department.name,
                "consultation_fee": str(
                    doctor.consultation_fee
                ),
            })

        return Response(data)

class DepartmentListCreateView(APIView):

    def get_permissions(self):

        if self.request.method == "GET":
            return [
                IsAuthenticated()
            ]

        return [
            IsAuthenticated(),
            IsAdminUser()
        ]

    def get(self, request):

        departments = (
            Department.objects
            .all()
            .order_by("name")
        )

        serializer = DepartmentSerializer(
            departments,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = DepartmentSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )

class DepartmentDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get_object(self, pk):

       return get_object_or_404(
            Department,
            pk=pk
)

    def get(self, request, pk):

        department = self.get_object(pk)

        serializer = DepartmentSerializer(
            department
        )

        return Response(serializer.data)

    def patch(self, request, pk):

        department = self.get_object(pk)

        serializer = DepartmentSerializer(
            department,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )


class MedicineListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get(self, request):

        medicines = Medicine.objects.all().order_by("name")

        serializer = MedicineSerializer(
            medicines,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = MedicineSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )


class MedicineDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get_object(self, pk):

        return get_object_or_404(
            Medicine,
            pk=pk
        )

    def get(self, request, pk):

        medicine = self.get_object(pk)

        serializer = MedicineSerializer(
            medicine
        )

        return Response(serializer.data)

    def patch(self, request, pk):

        medicine = self.get_object(pk)

        serializer = MedicineSerializer(
            medicine,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )


class LabTestListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get(self, request):

        lab_tests = LabTest.objects.all().order_by(
            "test_name"
        )

        serializer = LabTestSerializer(
            lab_tests,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = LabTestSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )


class LabTestDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get_object(self, pk):

        return get_object_or_404(
            LabTest,
            pk=pk
        )

    def get(self, request, pk):

        lab_test = self.get_object(pk)

        serializer = LabTestSerializer(
            lab_test
        )

        return Response(serializer.data)

    def patch(self, request, pk):

        lab_test = self.get_object(pk)

        serializer = LabTestSerializer(
            lab_test,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )