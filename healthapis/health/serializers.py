from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from health.models import User, HealthProfile, DailyHealthMetric, WorkoutPlan


class UserSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        u = User(**validated_data)
        u.set_password(u.password)
        u.save()

        return u

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'avatar', 'role', 'username', 'password')
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class HealthProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.ReadOnlyField()

    class Meta:
        model = HealthProfile
        fields = ('height', 'weight', 'age', 'gender', 'goal', 'bmi')

    def create(self, validated_data):
        hp = HealthProfile(**validated_data)
        hp.save()

        return hp


class HealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model= DailyHealthMetric
        fields= ['id', 'date', 'steps', 'water_intake', 'calories_burned', 'created_date']
    def validate_steps(self, value):
        if value < 0:
            raise ValidationError({'steps': 'Invalid steps'})
        return value
    def validate_water_intake(self, value):
        if value < 0:
            raise ValidationError({'water_intake': 'Invalid water intake'})
        return value

class WorkoutPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPlan
        fields = [ 'id','name','date','total_duration','note','created_date']
