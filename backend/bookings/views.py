"""
Bookings API.

Endpoints:
    POST   /api/skills/{skill_id}/bookings/   request a session  (requester)
    GET    /api/bookings/incoming/            bookings on my skills  (skill owner)
    GET    /api/bookings/outgoing/            bookings I made  (requester)
    GET    /api/bookings/{id}/                detail
    PATCH  /api/bookings/{id}/                advance status  (skill owner only)
"""

from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from skills.models import Skill

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingStatusUpdateSerializer,
)


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        skill = get_object_or_404(Skill, pk=self.kwargs["skill_id"])
        if skill.owner_id == self.request.user.id:
            raise PermissionDenied("You can't book your own skill.")
        if skill.availability != Skill.Availability.AVAILABLE:
            raise PermissionDenied("This skill is not currently accepting bookings.")
        serializer.save(skill=skill, requester=self.request.user)

    def create(self, request, *args, **kwargs):
        # Override `create` so the response shape matches the full BookingSerializer
        # (the create serializer is intentionally a thinner write-only shape).
        response = super().create(request, *args, **kwargs)
        booking = Booking.objects.select_related("skill", "requester").get(pk=response.data["id"])
        return Response(BookingSerializer(booking).data, status=response.status_code)


class IncomingBookingsView(generics.ListAPIView):
    """Bookings made on skills the current user owns."""

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects.filter(skill__owner=self.request.user)
            .select_related("skill", "skill__owner", "requester")
        )


class OutgoingBookingsView(generics.ListAPIView):
    """Bookings the current user has requested."""

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects.filter(requester=self.request.user)
            .select_related("skill", "skill__owner", "requester")
        )


class BookingDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.select_related("skill", "skill__owner", "requester")

    def get_serializer_class(self):
        return (
            BookingStatusUpdateSerializer
            if self.request.method in ("PATCH", "PUT")
            else BookingSerializer
        )

    def get_object(self):
        booking = super().get_object()
        # Both parties can read the booking; only the skill owner can modify status.
        is_owner = booking.skill.owner_id == self.request.user.id
        is_requester = booking.requester_id == self.request.user.id
        if not (is_owner or is_requester):
            raise PermissionDenied("You don't have access to this booking.")
        if self.request.method in ("PATCH", "PUT") and not is_owner:
            raise PermissionDenied("Only the skill owner can change the booking status.")
        return booking

    def update(self, request, *args, **kwargs):
        # Always respond with the full BookingSerializer shape after a status update.
        super().update(request, *args, **kwargs)
        booking = self.get_object()
        return Response(BookingSerializer(booking).data)
