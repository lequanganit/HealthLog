from health.views import UserViewSet, HealthMetricView, ExercisePlanView
from rest_framework import routers
from health import (views)
from django.urls import path, include, re_path
r = routers.DefaultRouter()
r.register('users', UserViewSet)
r.register('health_metrics', views.HealthMetricView, basename='health-metric')
r.register('exercises_plans', ExercisePlanView, basename='exercise-plan')
urlpatterns = [
    path('', include(r.urls))
]