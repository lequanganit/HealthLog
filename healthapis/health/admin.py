from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import *


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        'first_name', 'last_name', 'avatar',
        'username', 'email', 'role',
        'is_staff', 'is_active', 'active',
    )
    list_filter = ('role', 'is_staff', 'is_active')

    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'avatar'
                       )
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff',
                       )
        }),
        ('Timestamps', {
            'fields': ('created_date', 'updated_date')
        }),
    )

    readonly_fields = ('created_date', 'updated_date')

    add_fieldsets = (
        (None, {
            'fields': (
                'username', 'email', 'password1', 'password2', 'role', 'active', 'avatar'
            )
        }),
    )

    search_fields = ('username', 'email')
    ordering = ('username',)

admin.site.register(Expert)
admin.site.register(HealthProfile)
admin.site.register(Food)
admin.site.register(Exercise)
admin.site.register(NutritionPlan)
admin.site.register(ExercisePlan)
admin.site.register(DailyHealthMetric)
admin.site.register(ExercisePlant_Exercise)
admin.site.register(Connection)

# Register your models here.
