from django.conf import settings
from django.db import models

from skills.models import Skill


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="bookings")
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings_made",
    )
    message = models.TextField()
    proposed_at = models.DateTimeField(help_text="When the requester wants the session.")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.requester.username} -> {self.skill.title} ({self.status})"
