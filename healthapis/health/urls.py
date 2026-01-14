from health.views import UserViewSet, ExercisePlanViewSet, HealthProfileViewSet, ReminderViewSet, HealthJournalViewSet, \
    ExpertViewSet
from rest_framework import routers
from health import (views)
from django.urls import path, include, re_path

r = routers.DefaultRouter()
r.register('users', UserViewSet, basename='user')
r.register('experts', ExpertViewSet, basename='experts')
r.register('healthprofiles', HealthProfileViewSet, basename='healthprofile')
r.register('health_metrics', views.HealthMetricViewSet, basename='health-metric')
r.register('exercises_plans', ExercisePlanViewSet, basename='exercise-plan')
r.register('reminders', ReminderViewSet, basename='reminders')
r.register('HealthJournal', HealthJournalViewSet, basename='HealthJournal')
r.register('exercises', views.ExerciseView, basename='exercise')
r.register('connections', views.ConnectionViewSet, basename='connections')

urlpatterns = [
    path('', include(r.urls)),

]
