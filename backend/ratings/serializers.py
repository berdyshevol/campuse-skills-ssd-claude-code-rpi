from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "skill", "reviewer", "stars", "review", "created_at"]
        # `skill` is set from the URL kwarg in the view, never from the request body.
        read_only_fields = ["skill"]
