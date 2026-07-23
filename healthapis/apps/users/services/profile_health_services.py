from HealthLog.healthapis.apps.users.models import ProfileHealth


class ProfileHealthService:

    @staticmethod
    def get_profile_health(user_id):
        try:
            profile_health = ProfileHealth.objects.get(user_id=user_id)
            return profile_health
        except ProfileHealth.DoesNotExist:
            return None

    @staticmethod
    def create_profile_health(data):
        profile_health = ProfileHealth(
            user_id=data["user_id"],
            day_of_birth=data.get("day_of_birth"),
            gender=data.get("gender"),
        )
        profile_health.save()
        return profile_health

    @staticmethod
    def update_profile_health(user_id, data):
        profile_health = ProfileHealth.objects.filter(user_id=user_id).first()
        if profile_health:
            profile_health.day_of_birth = data.get(
                "day_of_birth", profile_health.day_of_birth
            )
            profile_health.gender = data.get("gender", profile_health.gender)
            profile_health.save()
