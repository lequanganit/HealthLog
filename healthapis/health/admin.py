from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Expert)
admin.site.register(HealthProfile)
admin.site.register(Food)
admin.site.register(Exercise)
admin.site.register(NutritionPlan)
admin.site.register(WorkoutPlan)
# Register your models here.
