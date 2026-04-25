from django.db.models import Avg
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Skill


class SkillSerializer(serializers.ModelSerializer):
    # Nested read-only owner block so the client gets username/email without an extra request.
    owner = UserSerializer(read_only=True)
    # Computed fields populated from the queryset annotations in views.SkillViewSet.
    average_rating = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    # CloudinaryField returns a CloudinaryResource; we expose its URL string to the client.
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "category",
            "pricing_type",
            "price",
            "contact_pref",
            "availability",
            "image",
            "image_url",
            "average_rating",
            "rating_count",
            "created_at",
            "updated_at",
        ]
        # `image` is a write-only upload field; clients read `image_url` instead.
        extra_kwargs = {"image": {"write_only": True, "required": False}}

    def get_image_url(self, obj: Skill) -> str | None:
        if not obj.image:
            return None
        try:
            return obj.image.url
        except Exception:
            return None

    def validate(self, data):
        pricing = data.get("pricing_type") or getattr(self.instance, "pricing_type", None)
        price = data.get("price", getattr(self.instance, "price", None))
        if pricing == Skill.Pricing.PAID and (price is None or price <= 0):
            raise serializers.ValidationError(
                {"price": "Paid skills must have a price greater than zero."}
            )
        if pricing == Skill.Pricing.FREE:
            data["price"] = None
        return data
