"""
Auth views.

We use Django's built-in session auth (a `sessionid` cookie set on the
browser). The Next.js client must:
  1. Call GET /api/auth/csrf/ once on app load to receive the `csrftoken` cookie
  2. Send `credentials: "include"` on every fetch
  3. Echo the CSRF token in the `X-CSRFToken` header on POST/PUT/PATCH/DELETE
"""

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def csrf(request):
    """Force-set the CSRF cookie. Call this once from the client on first load."""
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    login(request, user)
    return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        request,
        username=serializer.validated_data["username"],
        password=serializer.validated_data["password"],
    )
    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    login(request, user)
    return Response(UserSerializer(user).data)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def me(request):
    if not request.user.is_authenticated:
        return Response(
            {"detail": "Not authenticated."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(UserSerializer(request.user).data)
