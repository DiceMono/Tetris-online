from django.urls import path
from .consumers import TetrisConsumer

websocket_urlpatterns = [
    path('ws/tetris/<slug:room_name>/', TetrisConsumer),
]
