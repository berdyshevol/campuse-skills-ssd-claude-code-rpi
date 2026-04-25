"""
Custom DRF permission: anyone can read, but only the owner can edit/delete.

This is a common pattern for resources with an `owner` foreign key.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read methods (GET, HEAD, OPTIONS) are open to anyone.
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write methods require auth + ownership.
        return bool(request.user and request.user.is_authenticated and obj.owner_id == request.user.id)
