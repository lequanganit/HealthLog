from rest_framework import viewsets, permissions, parsers, status, generics, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from health.models import User, HealthProfile, DailyHealthMetric, WorkoutPlan
from health.serializers import UserSerializer, HealthProfileSerializer, HealthMetricSerializer, WorkoutPlanSerializer


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
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # tự gán user khi POST, ko cần client gửi lên bảo mật
        serializer.save(user=self.request.user)

class ExercisePlanViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView,
                       generics.UpdateAPIView, generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkoutPlanSerializer
    queryset = WorkoutPlan.objects.filter(active=True)
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        # chỉ lấy kế hoạch của user đang đăng nhập
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # gán user khi tạo
        serializer.save(user=self.request.user)
