from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.models import BaseModel
from cloudinary.models import CloudinaryField


class UserRole(models.TextChoices):
    USER = "USER"
    ADMIN = "ADMIN"
    EXPERT = "EXPERT"


class Gender(models.TextChoices):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class GoalUser(models.TextChoices):
    WEIGHT_GAIN = "WEIGHT_GAIN"
    WEIGHT_LOSS = "WEIGHT_LOSS"
    MAINTAINING = "MAINTAINING"


class User(AbstractUser, BaseModel):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.USER
    )
    avatar = CloudinaryField(null=True, blank=True)


class ProfileHealth(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    day_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10, choices=Gender.choices, null=True, blank=True
    )


class ProfileMatric(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    goal = models.CharField(
        max_length=20, choices=GoalUser.choices, null=True, blank=True
    )
    daily_water_intake = models.FloatField(null=True, blank=True)
    daily_steps = models.IntegerField(null=True, blank=True)
    bmi = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "created_date"], name="user_created_date_idx")
        ]

        ordering = ["-created_date"]
