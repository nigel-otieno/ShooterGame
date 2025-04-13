from django.shortcuts import render
from django.http import JsonResponse
from .models import HighScore
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from datetime import datetime

def play_game(request):
    return render(request, "game/play.html")

@csrf_exempt
@require_POST
def submit_score(request):
    try:
        data = json.loads(request.body)
        name = data.get("name", "Player")
        score = int(data.get("score", 0))
        HighScore.objects.create(name=name, score=score)
        return JsonResponse({"status": "ok"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

def leaderboard(request):
    limit = request.GET.get('limit', '10')
    sort = request.GET.get('sort', 'score')
    date_filter = request.GET.get('date')

    queryset = HighScore.objects.all()

    if date_filter:
        queryset = queryset.filter(created_at__date=date_filter)

    if sort == 'date':
        queryset = queryset.order_by('-created_at')
    else:
        queryset = queryset.order_by('-score')

    if limit != 'all':
        queryset = queryset[:int(limit)]

    return render(request, "game/leaderboard.html", {"scores": queryset})


