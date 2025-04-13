from django.urls import path
from . import views
from .views import *
urlpatterns = [
    path("play/", views.play_game, name="play"),
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    path("submit-score/", views.submit_score, name="submit_score"),
]