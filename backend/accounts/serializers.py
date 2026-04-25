"""
Serializers convert Django model instances <-> JSON for the REST API.

Think of them as the DRF equivalent of "form + JSON encoder" combined:
they validate incoming data, then save or shape it for the response.
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Read-only shape returned to clients (never includes password)."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class RegisterSerializer(serializers.ModelSerializer):
    # write_only means the value is accepted on input but never sent back in responses.
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def create(self, validated_data):
        # User.objects.create_user hashes the password; never store passwords in plain text.
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
