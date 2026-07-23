from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from apps.authentication.services.auth_service import AuthService
from .serializers import RegisterSerializer, LoginSerializer
from drf_yasg.utils import swagger_auto_schema


class RegisterAPIView(APIView):

    @swagger_auto_schema(
        tags=["AUTH"],
        operation_summary="Register",
        operation_description="Đăng ký tài khoản",
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = AuthService.register(serializer.validated_data)

        return Response(
            {
                "message": "User registered successfully",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(APIView):
    @swagger_auto_schema(
        tags=["AUTH"],
        operation_summary="Login",
        operation_description="Đăng nhập tài khoản",
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_data = AuthService.login(serializer.validated_data)

        return Response(
            {
                "message": "User logged in successfully",
                "user_id": user_data["user"].id,
                "username": user_data["user"].username,
                "email": user_data["user"].email,
            },
            status=status.HTTP_200_OK,
        )
