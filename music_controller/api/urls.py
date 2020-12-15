from django.urls import path
from .views import RoomCreate, RoomView, CreateRoomView, GetRoom

urlpatterns = [
    path('view' , RoomView.as_view()),
    path('create' , RoomCreate.as_view()),
    path('create-room' , CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view())
]
