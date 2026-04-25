from django.contrib import admin

from .models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("skill", "reviewer", "stars", "created_at")
    list_filter = ("stars",)
    search_fields = ("skill__title", "reviewer__username")
