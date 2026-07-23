from HealthLog.healthapis.apps.users.models import ProfileHealth


class HeathProfileRepository:
    # lấy theo id
    @staticmethod
    def get_profile_health_by_user_id(self, user_id):
        return (
            ProfileHealth.objects.filter(user_id=user_id)
            .order_by("-created_date")
            .first()
        )

    # lấy theo tuần chỉ định
    @staticmethod
    def get_profile_health_by_user_id_and_target_date(self, user_id, target_date):
        return ProfileHealth.objects.filter(
            user_id=user_id, created_date__date=target_date
        ).first()

    # lấy tất cả
    @staticmethod
    def get_all_profile_health_by_user_id(self, user_id):
        return ProfileHealth.objects.filter(user_id=user_id).order_by("-created_date")

    @staticmethod
    def create_profile_health(data):
        profile_health = ProfileHealth(
            user_id=data["user_id"],
            height=data.get("height"),
            weight=data.get("weight"),
            day_of_birth=data.get("day_of_birth"),
            gender=data.get("gender"),
        )
        profile_health.save()
        return profile_health
