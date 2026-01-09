from datetime import datetime, date

from rest_framework import viewsets, permissions, parsers, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from health import paginators


from health.perms import IsUser, IsExpert, IsConnectionOwnerOrExpert

from health.models import User, HealthProfile, DailyHealthMetric, ExercisePlan, HealthJournal, Reminder, Exercise, \
    ExercisePlant_Exercise, Connection, UserRole, Expert
from health.serializers import UserSerializer, HealthProfileSerializer, HealthMetricSerializer, ExercisePlanSerializer, \
    HealthJournalSerializer, ReminderSerializer, ExerciseSerializer, ExerciseInPlanSerializer, \
    AddExerciseToPlanSerializer, ConnectionSerializer


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


class HealthJournalViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthJournalSerializer
    queryset = HealthJournal.objects.filter(active=True)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        today = date.today()
        existing_journal = HealthJournal.objects.filter(
            user=self.request.user,
            update_date=today,
            active=True
        ).first()

        if existing_journal:
            serializer.instance = existing_journal
            serializer.save()

        else:
            serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        today = date.today()

        existing_journal = HealthJournal.objects.filter(
            user=self.request.user,
            date=today,
            active=True
        ).exists()

        response = super().create(request, *args, **kwargs)

        if existing_journal:
            response.status_code = status.HTTP_200_OK
            response.data['message'] = "Đã cập nhật nhật ký ngày hôm nay."
        return response


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user).order_by('-remind_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExerciseView(viewsets.ViewSet,
                   generics.ListAPIView,
                   generics.CreateAPIView,
                   generics.RetrieveAPIView,
                   generics.DestroyAPIView):
    queryset = Exercise.objects.filter(active=True)
    http_method_names = ['get', 'post',  'delete']
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.ItemPagination


class ExpertUserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        print(user)
        print("hello")
        if user.role != UserRole.EXPERT:
            raise PermissionDenied("Chỉ chuyên gia mới được truy cập")

        connected_user_ids = Expert.objects.filter(user=user)

        print(connected_user_ids)

        profiles = HealthProfile.objects.filter(user__id__in=connected_user_ids)

        serializer = HealthProfileSerializer(profiles, many=True)

        print(profiles)
        print(serializer.data)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'USER':
            return Connection.objects.filter(user=user)
        return Connection.objects.filter(expert__user=user)

    def perform_create(self, serializer):
        if self.request.user.role != 'USER':
            raise PermissionDenied("Chỉ USER được tạo kết nối")
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action == 'create':
            return [IsUser()]
        if self.action == 'partial_update':
            return [IsExpert()]
        if self.action in ['retrieve', 'destroy']:
            return [permissions.IsAuthenticated(), IsConnectionOwnerOrExpert()]
        return super().get_permissions()
