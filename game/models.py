from django.db import models
from django.contrib.auth.models import User

class GameSession(models.Model):
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class HighScore(models.Model):
    name = models.CharField(max_length=100)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.score}"

