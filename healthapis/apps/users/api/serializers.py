from datetime import date

from rest_framework import serializers

from HealthLog.healthapis.apps.users.models import GoalUser


class ProfileHealthSerializer(serializers.Serializer):
    day_of_birth = serializers.DateField(
        required=False,
        allow_null=True,
        error_messages={"invalid": "Invalid date format."},
    )
    gender = serializers.CharField(
        required=False,
        allow_null=True,
        max_length=10,
        error_messages={
            "invalid": "Invalid gender value.",
            "invalid_choice": "Invalid gender choice.",
        },
    )

    def validate_day_of_birth(self, value):

        today = date.today()

        if value > today:
            raise serializers.ValidationError("Day of birth cannot be in the future.")

        age = (
            today.year
            - value.year
            - ((today.month, today.day) < (value.month, value.day))
        )

        if age < 16:
            raise serializers.ValidationError("User must be at least 16 years old.")

        if age > 100:
            raise serializers.ValidationError("User must be at most 100 years old.")

        return value


class ProfileMatricSerializer(serializers.Serializer):
    height = serializers.FloatField(
        required=True,
        allow_null=False,
        error_messages={
            "required": "Height is required.",
            "invalid": "Height must be a number.",
        },
    )
    weight = serializers.FloatField(
        required=True,
        allow_null=False,
        error_messages={
            "required": "Weight is required.",
            "invalid": "Weight must be a number.",
        },
    )
    goal = serializers.CharField(
        required=True,
        allow_null=False,
        error_messages={
            "required": "Goal is required.",
            "invalid": "Invalid goal value.",
        },
        max_length=20,
    )
    daily_water_intake = serializers.FloatField(
        required=True,
        allow_null=False,
        error_messages={
            "required": "Daily water intake is required.",
            "invalid": "Daily water intake must be a number.",
        },
    )
    daily_steps = serializers.IntegerField(
        required=True,
        allow_null=False,
        error_messages={
            "required": "Daily steps is required.",
            "invalid": "Daily steps must be a number.",
        },
    )
