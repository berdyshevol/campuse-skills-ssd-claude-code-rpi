from django.urls import path

from . import views

# These paths are prefixed with /api/auth/ in skillswap/urls.py.
urlpatterns = [
    path("csrf/", views.csrf),
    path("register/", views.register),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
    path("me/", views.me),
]
