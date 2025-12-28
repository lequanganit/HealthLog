from rest_framework import serializers

from health.models import User


class UserSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        u = User (**validated_data)
        u.set_password(u.password)
        u.save()

        return u

    class Meta:
        model = User
        fields = ('first_name','last_name', 'email','avatar','role','username', 'password')
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

