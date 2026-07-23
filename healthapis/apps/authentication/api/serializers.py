from rest_framework import serializers
from django.core.validators import RegexValidator

password_validation = RegexValidator(
    regex=r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
    message="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
)

number_phone_validation = RegexValidator(
    regex=r"^0[3|5|7|8|9]\d{8}$",
    message="Invalid phone number format. Must start with 0 followed by 3, 5, 7, 8, or 9 and contain a total of 10 digits.",
)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True, allow_blank=False)
    email = serializers.EmailField(max_length=254, required=True, allow_blank=False)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
        allow_blank=False,
        validators=[password_validation],
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
        error_messages={"required": "Confirm password is required."},
    )
    first_name = serializers.CharField(
        max_length=30,
        required=True,
        allow_blank=False,
        error_messages={"required": "First name is required."},
    )
    last_name = serializers.CharField(
        max_length=30,
        required=True,
        allow_blank=False,
        error_messages={"required": "Last name is required."},
    )
    number_phone = serializers.CharField(
        max_length=11,
        required=True,
        allow_blank=False,
        validators=[number_phone_validation],
        error_messages={"required": "Phone number is required."},
    )
    avatar = serializers.ImageField(required=False)

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = self.initial_data.get("confirm_password")
        if password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        max_length=254,
        required=True,
        allow_blank=False,
        error_messages={"required": "Email is required."},
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        allow_blank=False,
        error_messages={"required": "Password is required."},
    )
