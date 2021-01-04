from django.shortcuts import redirect, render
from requests import Request, post
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import json
from urllib.request import urlopen
import io
import random

from colorthief import ColorThief

from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET, AUTHORIZE_URL, TOKEN_URL
from .util import *
from api.models import Room


# Create your views here.

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', AUTHORIZE_URL, params={
            'scope': scopes, 
            'response_type' : 'code', 
            'redirect_uri': REDIRECT_URI, 
            'client_id' : CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post(TOKEN_URL, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri' : REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret' :CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    refresh_token = response.get('refresh_token')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):

    @staticmethod
    def construct_song_response(response):
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        album_name = item.get('album').get('name')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""
        for i, artist in enumerate(item.get('artists')):
            if i>0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name
        song = {
            'title' : item.get('name'),
            'album' : album_name,
            'artist' : artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }
        return song

    @staticmethod
    def construct_sections(room_code, response, image_url):
        sections_ = response['sections']
        def rgb_to_hex(rgb):
            return ('#%02x%02x%02x' % rgb).upper()
        sections = []

        f = io.BytesIO(urlopen(image_url).read())
        color_thief = ColorThief(f)
        color_pallete = color_thief.get_palette(quality=1)
        color_pallete.insert(0, color_thief.get_color(quality=1))
        color_pallete = [rgb_to_hex(color) for color in color_pallete]
        if len(color_pallete)>0:
            while(len(color_pallete) < len(sections_)):
                print("im in loop")
                for i in color_pallete:
                    color_pallete.append(i)
        else:
            r = lambda: random.randint(0,255)
            for i in range(len(sections_)):
                color_pallete.append('#%02X%02X%02X' % (r(),r(),r()))

        for i, section in enumerate(sections_):
            this = {
                'tempo': section['tempo'],
                'duration': section['duration'],
                'color': color_pallete[i],
                'start': section['start']
            }
            sections.append(this)
        with open(f"{room_code}_sections.json", "w") as outfile:  
            json.dump(sections, outfile, indent=4)

    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
            song_id = room.song_id
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        
        host = room.host
        endpoint = "me/player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        song = self.construct_song_response(response)
        
        section = []
        try:
            with open(f"{room_code}_sections.json", "r") as f:  
                sections = json.load(f)
        except Exception as e:
            with open(f"{room_code}_sections.json", "w") as f:  
                json.dump([], f)
        with open(f"{room_code}_sections.json", "r") as f:  
                sections = json.load(f)
        
        if (sections == [] or song_id != song['id']):
            room.song_id = song['id']
            room.save(update_fields=['song_id'])
            endpoint = f"audio-analysis/{song['id']}"
            print("WARNING: executing an audio-analysis request")
            response = execute_spotify_api_request(host, endpoint)
            self.construct_sections(room_code, response, song['image_url'])
        
        for section in sections:
            if section['start'] >= (song['time']/1000):
                break
        section = {'section': section}
        song = {**song, **section}

        return Response(song, status=status.HTTP_200_OK)

class PauseSong(APIView):
    def put(self, request, formmat=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, formmat=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)