from django.contrib.auth import authenticate

from apps.authentication.repositories.user_repository import UserRepository


class AuthService:
    @staticmethod
    def register(data):

        if UserRepository.get_user_by_email(data["email"]):
            raise ValueError("Email already exists")

        user = UserRepository.create_user(data)

        return user

    @staticmethod
    def login(data):

        user = UserRepository.get_user_by_email(data["email"])

        if user is None:
            raise ValueError("Invalid email or password")

        user = authenticate(username=user.username, password=data["password"])

        if user is None:
            raise ValueError("Sai mật khẩu")

        return {
            "user": user,
        }
