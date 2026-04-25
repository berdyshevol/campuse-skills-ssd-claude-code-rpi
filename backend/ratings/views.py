"""
Ratings live under /api/skills/{skill_id}/ratings/.

We use a `generics.ListCreateAPIView` for list+create on the nested route
and a `generics.DestroyAPIView` for delete on a flat /api/ratings/{id}/ route.
"""

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, serializers
from rest_framework.exceptions import PermissionDenied

from skills.models import Skill

from .models import Rating
from .serializers import RatingSerializer


class SkillRatingsView(generics.ListCreateAPIView):
    serializer_class = RatingSerializer

    def get_permissions(self):
        # Anyone can read ratings; only authenticated users can create one.
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Rating.objects.filter(skill_id=self.kwargs["skill_id"]).select_related(
            "reviewer"
        )

    def perform_create(self, serializer):
        skill = get_object_or_404(Skill, pk=self.kwargs["skill_id"])
        # Don't let owners review their own skill (would game the average).
        if skill.owner_id == self.request.user.id:
            raise PermissionDenied("You can't rate your own skill.")
        try:
            serializer.save(skill=skill, reviewer=self.request.user)
        except IntegrityError:
            raise serializers.ValidationError(
                {"detail": "You've already reviewed this skill."}
            )


class RatingDeleteView(generics.DestroyAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Only the reviewer can delete their own rating.
        if instance.reviewer_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own reviews.")
        instance.delete()
