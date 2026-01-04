from rest_framework.permissions import BasePermission

class IsUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'USER'
        )
class IsExpert(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'EXPERT'
        )
# chi 2 ben trong connection moi co quyen truy cap
class IsConnectionOwnerOrExpert(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user == obj.user
            or request.user == obj.expert.user
        )
