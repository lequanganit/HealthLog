from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import generics
from health.models import User
from health.serializers import UserSerializer, HealthMetricSerializer, DailyHealthMetric, WorkoutPlanSerializer, WorkoutPlan


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=["get"], url_path="me", detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_me(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class HealthMetricView(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView,generics.RetrieveAPIView,generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HealthMetricSerializer
    queryset = DailyHealthMetric.objects.filter(active=True)

    def get_queryset(self):
        # chỉ lấy dữ liệu của user đang đăng nhập
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # tự gán user khi POST, ko cần client gửi lên bảo mật
        serializer.save(user=self.request.user)
class ExercisePlanView(viewsets.ViewSet,generics.ListAPIView,generics.CreateAPIView,generics.RetrieveAPIView,generics.UpdateAPIView,generics.DestroyAPIView):
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
