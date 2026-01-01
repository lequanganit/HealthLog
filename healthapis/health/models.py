from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField

class UserRole(models.TextChoices):
    USER = 'USER'
    EXPERT = 'EXPERT'
    ADMIN = 'ADMIN'
class Gender(models.TextChoices):
    MALE = 'MALE'
    FEMALE = 'FEMALE'
    OTHER = 'OTHER'

class Expertise(models.TextChoices):
    WEIGHT_GAIN = 'WEIGHT_GAIN'
    WEIGHT_LOSS = 'WEIGHT_LOSS'
    MAINTAINING = 'MAINTAINING'

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class User(AbstractUser, BaseModel):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20,choices=UserRole.choices,default=UserRole.USER)
    avatar = CloudinaryField(null=True, blank=True)
    def __str__(self):
        return self.username

class Expert(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    expertise = models.CharField(max_length=30,choices=Expertise.choices)

    def __str__(self):
        return f"{self.user.username} - {self.expertise}"

# ho so suc khoe
class HealthProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    height = models.FloatField()
    weight = models.FloatField()
    age = models.IntegerField()
    gender = models.CharField(max_length=10,choices=Gender.choices)
    goal = models.CharField(max_length=255)
    bmi = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.height and self.weight:
            height_m = self.height / 100
            self.bmi = round( (self.weight / (height_m **2)),2)
            super().save( *args, **kwargs)

    def __str__(self):
        return f"Hồ sơ của {self.user.username} - chỉ số BMI là: {self.bmi}"

#chi so co ban
class DailyHealthMetric(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    steps = models.IntegerField()
    water_intake = models.FloatField()
    calories_burned = models.FloatField()

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date}"

#nhac nho
class Reminder(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title_name = models.CharField(max_length=100)
    time = models.CharField(max_length=50)
    describe = models.TextField(default='')

    def __str__(self):
        return self.title_name

#mon an
class Food(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

#ke hoach dinh duong
class NutritionPlan(BaseModel):
    health_profile = models.ForeignKey(HealthProfile, on_delete=models.CASCADE)
    goal_type = models.CharField(max_length=100)
    foods = models.ManyToManyField(Food)

    def __str__(self):
        return self.goal_type

#ke hoach tap luyen
class ExercisePlan(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    date = models.DateField()
    total_duration = models.CharField(max_length=50)
    note = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

# bai tap
class Exercise(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

# mqh giua bai tap va ke hoach tap luyen
class ExercisePlant_Exercise(BaseModel):
    exercise_plan = models.ForeignKey(ExercisePlan, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    repetitions = models.IntegerField()
    duration = models.IntegerField()  # minutes

    class Meta:
        unique_together = ('exercise_plan', 'exercise')

# nhat ki suc khoe
class HealthJournal(BaseModel):
    exercise_plan = models.OneToOneField(ExercisePlan, on_delete=models.CASCADE)
    content = models.TextField()


    def __str__(self):
        return f"Nhật ký {self.updated_date}"
