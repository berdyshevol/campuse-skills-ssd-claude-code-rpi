from django.urls import path

from . import views

urlpatterns = [
    path("skills/<int:skill_id>/ratings/", views.SkillRatingsView.as_view()),
    path("ratings/<int:pk>/", views.RatingDeleteView.as_view()),
]
