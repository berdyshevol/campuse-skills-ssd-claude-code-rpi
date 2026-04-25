"""
Top-level URL routing for the SkillSwap API.

Each app owns its own urls.py; this file just plugs them in under /api/<app>/.
The Django admin lives at /admin/ and is the easiest way to inspect data
during development.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("skills.urls")),
    path("api/", include("ratings.urls")),
    path("api/", include("bookings.urls")),
]
