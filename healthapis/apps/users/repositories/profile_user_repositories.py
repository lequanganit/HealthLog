from HealthLog.healthapis.apps.users.models import ProfileHealth


class ProFileUserRepository:

    @staticmethod
    def get_profile_user_by_user_id(user_id):
        return ProfileHealth.objects.filter(user_id=user_id).first()

    @staticmethod
    def create_profile_user(data):
        profile_user = ProfileHealth(
            user_id=data["user_id"],
            day_of_birth=data.get("day_of_birth"),
            gender=data.get("gender"),
        )
        profile_user.save()
        return profile_user

    @staticmethod
    def update_profile_user(user_id, data):
        profile_user = ProfileHealth.objects.filter(user_id=user_id).first()
        if profile_user:
            profile_user.day_of_birth = data.get(
                "day_of_birth", profile_user.day_of_birth
            )
            profile_user.gender = data.get("gender", profile_user.gender)
            profile_user.save()
