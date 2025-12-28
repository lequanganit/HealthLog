from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from health.models import User
from health.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]

    @action(methods=["get"], url_path="me", detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_me(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)