from health.views import UserViewSet, ExercisePlanViewSet, HealthProfileViewSet
from rest_framework import routers
from health import (views)
from django.urls import path, include, re_path


r = routers.DefaultRouter()
r.register('users', UserViewSet, basename ='user')
r.register('healthprofiles', HealthProfileViewSet, basename ='healthprofile')
r.register('health_metrics', views.HealthMetricViewSet, basename='health-metric')
r.register('exercises_plans', ExercisePlanViewSet, basename='exercise-plan')

urlpatterns = [
    path('', include(r.urls))
]