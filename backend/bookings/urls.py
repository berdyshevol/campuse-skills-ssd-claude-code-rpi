from django.urls import path

from . import views

urlpatterns = [
    path("skills/<int:skill_id>/bookings/", views.BookingCreateView.as_view()),
    path("bookings/incoming/", views.IncomingBookingsView.as_view()),
    path("bookings/outgoing/", views.OutgoingBookingsView.as_view()),
    path("bookings/<int:pk>/", views.BookingDetailView.as_view()),
]
