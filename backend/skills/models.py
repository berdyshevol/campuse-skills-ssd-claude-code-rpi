"""
The Skill model is the central record in SkillSwap: one row per service
a student is offering.

A "model" in Django is a Python class that maps to a database table.
Each class attribute becomes a column. `makemigrations` reads this file
and produces a SQL migration; `migrate` applies it.
"""

from cloudinary.models import CloudinaryField
from django.conf import settings
from django.db import models


class Skill(models.Model):
    # Use TextChoices for readable, IDE-friendly enums (Django 3+).
    class Category(models.TextChoices):
        TUTORING = "tutoring", "Tutoring"
        DESIGN = "design", "Design"
        CODING = "coding", "Coding"
        MUSIC = "music", "Music"
        SPORTS = "sports", "Sports"
        WRITING = "writing", "Writing"
        OTHER = "other", "Other"

    class Pricing(models.TextChoices):
        FREE = "free", "Free"
        PAID = "paid", "Paid"

    class Contact(models.TextChoices):
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        INAPP = "inapp", "In-app message"

    class Availability(models.TextChoices):
        AVAILABLE = "available", "Available"
        BUSY = "busy", "Busy"
        PAUSED = "paused", "Paused"

    # ForeignKey = many-to-one relationship. on_delete=CASCADE means deleting
    # a user deletes their skills (clean for a marketplace; would be RESTRICT
    # if we wanted to keep historical data).
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skills",
    )
    title = models.CharField(max_length=120)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    pricing_type = models.CharField(max_length=10, choices=Pricing.choices)
    # Nullable so "free" skills can leave price blank.
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    contact_pref = models.CharField(max_length=10, choices=Contact.choices)
    availability = models.CharField(
        max_length=10,
        choices=Availability.choices,
        default=Availability.AVAILABLE,
    )
    # Cloudinary in prod, local file in dev when CLOUDINARY_URL is unset.
    image = CloudinaryField("image", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.owner.username})"
