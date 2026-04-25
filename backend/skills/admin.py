"""
Registering a model with the admin gives you a full CRUD UI at /admin/.
This is one of Django's killer features — useful for inspecting data
during development without writing any UI code.
"""

from django.contrib import admin

from .models import Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "pricing_type", "availability", "created_at")
    list_filter = ("category", "pricing_type", "availability")
    search_fields = ("title", "description", "owner__username")
    autocomplete_fields = ("owner",)
