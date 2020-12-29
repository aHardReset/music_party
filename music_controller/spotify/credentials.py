'''
This file is added and untracked to prevent share credentials
and sensitive info.

https://stackoverflow.com/questions/3319479/can-i-git-commit-a-file-and-ignore-its-content-changes

git update-index --assume-unchanged [<file> ...]

To undo and start tracking again:
git update-index --no-assume-unchanged [<file> ...]

Under dev. if more urls will be need to add be sure to hide secrets
soon this file will be deleted and make this in enviroment variables and .ini files if needed
'''

AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"
REDIRECT_URI = "http://127.0.0.1:8000/spotify/redirect",
CLIENT_ID = ""
CLIENT_SECRET = ""