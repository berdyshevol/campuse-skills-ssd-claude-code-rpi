from rest_framework import serializers

from accounts.serializers import UserSerializer
from skills.serializers import SkillSerializer

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "skill",
            "requester",
            "message",
            "proposed_at",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "skill", "requester"]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Used on POST: only the fields the requester actually fills in."""

    class Meta:
        model = Booking
        fields = ["message", "proposed_at"]


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Used on PATCH by the skill owner to advance the booking."""

    class Meta:
        model = Booking
        fields = ["status"]

    def validate_status(self, value):
        # Limit transitions to a small valid set; cancellation is requester-side, handled separately.
        valid_for_owner = {
            Booking.Status.ACCEPTED,
            Booking.Status.REJECTED,
            Booking.Status.COMPLETED,
        }
        if value not in valid_for_owner:
            raise serializers.ValidationError(
                "Owners may only set status to accepted, rejected, or completed."
            )
        return value
