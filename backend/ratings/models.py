from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from skills.models import Skill


class Rating(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="ratings")
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="given_ratings",
    )
    stars = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Database-level guarantee: one review per user per skill.
        # Trying to insert a duplicate raises IntegrityError, which DRF
        # turns into a 400 with a friendly message via the serializer.
        unique_together = ("skill", "reviewer")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.reviewer.username} -> {self.skill.title}: {self.stars}*"
