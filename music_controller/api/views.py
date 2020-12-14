from django.db import reset_queries
from django.db.models import query
from django.shortcuts import render
from rest_framework import generics, status
import rest_framework
from rest_framework.serializers import Serializer
from rest_framework.views import APIView
from rest_framework.response import Response


from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room

# Create your views here.

class RoomView(generics.ListAPIView): #or CreateAPIView
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomCreate(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room(host= host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()

            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)