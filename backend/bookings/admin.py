from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("skill", "requester", "status", "proposed_at", "created_at")
    list_filter = ("status",)
    search_fields = ("skill__title", "requester__username")
