"""
A `DefaultRouter` autogenerates URL patterns from a ViewSet:
    GET    /skills/        -> list
    POST   /skills/        -> create
    GET    /skills/{id}/   -> retrieve
    PATCH  /skills/{id}/   -> partial_update
    DELETE /skills/{id}/   -> destroy
    GET    /skills/mine/   -> @action(detail=False, methods=["get"])
"""

from rest_framework.routers import DefaultRouter

from .views import SkillViewSet

router = DefaultRouter()
router.register(r"skills", SkillViewSet, basename="skill")

urlpatterns = router.urls
