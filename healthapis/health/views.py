from datetime import datetime, date
from django.utils.timezone import now
from rest_framework import viewsets, permissions, parsers, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from health import paginators


from health.perms import IsUser, IsExpert, IsConnectionOwnerOrExpert

from health.models import User, HealthProfile, DailyHealthMetric, ExercisePlan, HealthJournal, Reminder, Exercise, \
    ExercisePlant_Exercise, Connection, UserRole, Expert
from health.serializers import UserSerializer, HealthProfileSerializer, HealthMetricSerializer, ExercisePlanSerializer, \
    HealthJournalSerializer, ReminderSerializer, ExerciseSerializer, ExerciseInPlanSerializer, \
    AddExerciseToPlanSerializer, ConnectionSerializer, ExpertSerializer


class UserViewSet(viewsets.ModelViewSet, generics.GenericAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=["get", 'patch'], url_path="current-user", detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):

        u = request.user
        if request.method.__eq__('patch'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name', 'email']:
                    setattr(u, k, v)
            u.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class HealthProfileViewSet(viewsets.ModelViewSet, generics.GenericAPIView):
    queryset = HealthProfile.objects.all()
    serializer_class = HealthProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HealthProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if HealthProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError({'detail': 'User with this username already exists.'})
        serializer.save(user=self.request.user)


class HealthMetricViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView,
                          generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthMetricSerializer
    queryset = DailyHealthMetric.objects.filter(active=True)

    def get_queryset(self):
        # chỉ lấy dữ liệu của user đang đăng nhập
        today = date.today()
        DailyHealthMetric.objects.get_or_create(
            user=self.request.user,
            date=today,
            defaults={
                "active": True
            }
        )
        return DailyHealthMetric.objects.filter(
            user = self.request.user,
            active = True,
        ).order_by('-date')

    def perform_create(self, serializer):
        # tự gán user khi POST, ko cần client gửi lên bảo mật
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        today = date.today()

        metric, created = DailyHealthMetric.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={
                "steps": request.data.get("steps", 0),
                "water_intake": request.data.get("water_intake", 0),
                "calories_burned": request.data.get("calories_burned", 0),
            }
        )

        if not created:
            metric.steps = request.data.get("steps", metric.steps)
            metric.water_intake = request.data.get(
                "water_intake", metric.water_intake
            )
            metric.calories_burned = request.data.get(
                "calories_burned", metric.calories_burned
            )
            metric.save()

        serializer = self.get_serializer(metric)
        return Response(serializer.data, status=status.HTTP_200_OK)


# kế hoạch tập luyện
class ExercisePlanViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExercisePlanSerializer
    http_method_names = ['get', 'post','patch', 'delete']

    def get_queryset(self):
        return ExercisePlan.objects.filter(
            active=True,
            user=self.request.user
        )


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.active = False
        instance.save(update_fields=['active'])

    @action(detail=True, methods=['get', 'post'])
    def exercises(self, request, pk):
        if request.method == 'GET':
            qs = ExercisePlant_Exercise.objects.filter(exercise_plan_id=pk, active=True).select_related('exercise')
            serializer = ExerciseInPlanSerializer(qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        serializer = AddExerciseToPlanSerializer(data=request.data, context={'plan_id': pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Thêm bài tập thành công"},
            status=status.HTTP_201_CREATED
        )


class HealthJournalViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    serializer_class = HealthJournalSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        # Lọc bản ghi active của user hiện tại
        return HealthJournal.objects.filter(user=self.request.user, active=True)
    def perform_create(self, serializer):
        # Gán user hiện tại khi tạo mới
        serializer.save(user=self.request.user)

class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).order_by('time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExerciseView(viewsets.ViewSet,
                   generics.ListAPIView,
                   generics.CreateAPIView,
                   generics.RetrieveAPIView,
                   generics.UpdateAPIView,
                   generics.DestroyAPIView):
    queryset = Exercise.objects.filter(active=True)
    http_method_names = ['get', 'post', 'patch', 'delete']
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.ItemPagination


class ExpertViewSet(viewsets.ModelViewSet):
    queryset = Expert.objects.all()
    serializer_class = ExpertSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return super().get_permissions()



class ConnectionViewSet(ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print("USER:", user, user.role)

        if user.role == UserRole.EXPERT:
            expert = Expert.objects.filter(user=user).first()
            print("EXPERT:", expert)

            qs = Connection.objects.filter(expert=expert)
            print("CONNECTIONS:", qs)

            return qs

        return Connection.objects.filter(user=user)
