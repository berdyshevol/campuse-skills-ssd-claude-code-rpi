"""
Skill API.

A `ViewSet` is a DRF class that bundles list/create/retrieve/update/destroy
into one place. With a router, you get all five REST endpoints for free.
"""

from django.db.models import Avg, Count, Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Skill
from .permissions import IsOwnerOrReadOnly
from .serializers import SkillSerializer


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        # `annotate` adds computed columns so we don't N+1 when serializing.
        qs = (
            Skill.objects.select_related("owner")
            .annotate(
                average_rating=Avg("ratings__stars"),
                rating_count=Count("ratings"),
            )
        )

        # Beginner-friendly search: a single `q` parameter matches title or description.
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)

        pricing = self.request.query_params.get("pricing")
        if pricing:
            qs = qs.filter(pricing_type=pricing)

        availability = self.request.query_params.get("availability")
        if availability:
            qs = qs.filter(availability=availability)

        return qs

    def perform_create(self, serializer):
        # Force the owner to be the logged-in user (clients can't fake it).
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """GET /api/skills/mine/ — current user's own skills."""
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)
