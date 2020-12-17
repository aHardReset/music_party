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
        if not serializer.is_valid():
            return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)
        
        guest_can_pause = serializer.data.get('guest_can_pause')
        votes_to_skip = serializer.data.get('votes_to_skip')
        host = self.request.session.session_key
        queryset = Room.objects.filter(host=host)

        if queryset.exists():
            room = queryset[0]
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            self.request.session['room_code'] = room.code
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        else:
            room = Room(host= host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
            room.save()
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format = None):
        code = request.GET.get(self.lookup_url_kwarg)

        if code == None:
            return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)

        room = Room.objects.filter(code=code)

        if len(room) <= 0:
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)
        
        data = RoomSerializer(room[0]).data
        data['is_host'] = self.request.session.session_key == room[0].host
        return Response(data, status=status.HTTP_200_OK)
        
class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code == None:
            return Response({'Bad request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)

        room_result = Room.objects.filter(code=code)
        if len(room_result) <= 0:
            return Response({'Room Not Found': 'Invalid Room code, did not find a code key'}, status=status.HTTP_404_NOT_FOUND)
        
        room = room_result[0]
        self.request.session['room_code'] = code
        return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)