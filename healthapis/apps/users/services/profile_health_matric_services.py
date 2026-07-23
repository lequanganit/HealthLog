from datetime import datetime, timezone

from healthapis.apps.users.models import ProfileMatric


class ProfileHealthMatricService:
    @staticmethod
    def get_profile_matric_by_user_id(user_id):
        return ProfileMatric.objects.filter(user_id=user_id).first()

    @staticmethod
    def create_profile_matric(data):
        profile_matric = ProfileMatric(
            user_id=data["user_id"],
            height=data.get("height"),
            weight=data.get("weight"),
            daily_steps=data.get("daily_steps"),
            daily_water_intake=data.get("daily_water_intake"),
            goal=data.get("goal"),
        )

        bmi = (
            data.get("weight") / ((data.get("height") / 100) ** 2)
            if data.get("height") and data.get("weight")
            else None
        )
        profile_matric.bmi = bmi

        profile_matric.save()
        return profile_matric

    @staticmethod
    def update_profile_health(user_id, data):
        dt = datetime.now(timezone.utc)
        if dt.weekday() == 0:  # Check if today is Monday (0 represents Monday)
            profile_matric = ProfileMatric.objects.filter(user_id=user_id).first()
            if profile_matric:
                profile_matric.height = data.get("height", profile_matric.height)
                profile_matric.weight = data.get("weight", profile_matric.weight)
                profile_matric.day_of_birth = data.get(
                    "day_of_birth", profile_matric.day_of_birth
                )
                profile_matric.sex = data.get("sex", profile_matric.sex)
