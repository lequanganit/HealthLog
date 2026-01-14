from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from health.models import User, HealthProfile, DailyHealthMetric, ExercisePlan, HealthJournal, Reminder, Exercise, \
    ExercisePlant_Exercise, Connection, Expert, UserRole


class UserSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        u = User(**validated_data)
        u.set_password(u.password)
        u.save()

        return u

    class Meta:
        model = User
        fields = ('id','first_name', 'last_name', 'email', 'avatar', 'role', 'username', 'password')
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

class ExpertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expert
        fields = ["id", "user", "expertise", "experience_year"]

    def validate_user(self, user):
        if user.role != UserRole.EXPERT:
            raise serializers.ValidationError(
                "User must have role EXPERT"
            )

        if Expert.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                "Expert already exists for this user"
            )

        return user



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

class ExercisePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExercisePlan
        fields = [ 'id','name','date','total_duration','note','created_date']

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'created_date', 'updated_date']
        #he thong tu tao, ko cho client gui len
        read_only_fields = ['id', 'created_date', 'updated_date']

class ExerciseInPlanSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='exercise.name')
    description = serializers.CharField(source='exercise.description')
    class Meta:
        model = ExercisePlant_Exercise
        fields = ['id', 'name', 'description', 'repetitions', 'duration']

class AddExerciseToPlanSerializer(serializers.ModelSerializer):
    exercise_id = serializers.IntegerField()
    class Meta:
        model = ExercisePlant_Exercise
        fields = ['exercise_id', 'repetitions', 'duration']
    def create(self, validated_data):
        plan_id = self.context['plan_id']
        exercise_id = validated_data.pop('exercise_id')
        return ExercisePlant_Exercise.objects.create(
            exercise_plan_id=plan_id,
            exercise_id=exercise_id,
            active=True,
            **validated_data
        )

class HealthJournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthJournal
        fields = ['id','exercise_plan','content','created_date']

class ReminderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    describe  = serializers.CharField(required=False,allow_blank=True)
    class Meta:
        model = Reminder
        fields = ['id','user','title_name','time','describe','created_date']

class ConnectionSerializer(serializers.ModelSerializer):
    expert_info = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = ['id', 'expert', 'status', 'expert_info']
        read_only_fields = ['status']

    def get_expert_info(self, obj):
        return {
            "id": obj.expert.id,
            "username": obj.expert.user.username,
            "expertise": obj.expert.expertise,
        }