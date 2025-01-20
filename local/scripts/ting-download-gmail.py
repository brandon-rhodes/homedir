#!uv run
#
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "google-api-python-client",
#     "google-auth-httplib2",
#     "google-auth-oauthlib",
# ]
# ///
#
# Invoke with: uv run ting-download-gmail.py
#
# The Ting fire safety appliance https://www.tingfire.com/ plugs into an
# outlet and monitors the outlet's voltage, to detect home fire hazards
# like a floating neutral or an arcing switch.  I received a Ting for
# free from my home's insurer, State Farm.
#
# Each week, I receive a summary email from Ting's operator, Whisker
# Labs Inc., with links to 7 PNG images, each of which graphs my home's
# voltage over one day.  This script downloads all such images by doing
# a Gmail search for weekly Ting emails, downloading all email bodies,
# and then downloading each PNG image.
#
# Email bodies and images are saved to the ~/.cache/ting/ directory.
#
# If you get the error:
#
#     invalid_grant: Bad Request
#
# the remove the file `token-google-api.json` and try again.  (Update:
# the code now tries doing this itself.)

import datetime as dt
import os.path
import re
import urllib.request
from base64 import urlsafe_b64decode
from email.parser import Parser
from email.policy import default
from pathlib import Path

import google.auth.exceptions
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def main():
    os.chdir(os.path.dirname(__file__))
    token_path = 'token-google-api.json'
    token_existed = os.path.exists(token_path)
    try:
        creds = get_creds(token_path)
    except google.auth.exceptions.RefreshError:
        if not token_existed:
            raise
        print('RefreshError; removing token-google-api.json and trying again')
        os.unlink('token-google-api.json')
        creds = get_creds(token_path)

    try:
        download_messages(creds)
    except HttpError as error:
        exit(f'An error occurred: {error}')

def get_creds(token_path):
    creds = None

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return creds

def download_messages(creds):
    cache_dir = Path('~/.cache/ting').expanduser()
    if not cache_dir.is_dir():
        cache_dir.mkdir()

    service = build('gmail', 'v1', credentials=creds)

    list_path = do_search(service, cache_dir)
    get_messages(service, cache_dir, list_path)
    chart_urls = list(get_chart_urls(cache_dir))
    chart_paths = list(download_charts(cache_dir, chart_urls))
    chart_paths.sort()
    for path in chart_paths:
        print(path)

def do_search(service, cache_dir):
    list_path = cache_dir / 'MESSAGE_IDS'

    # If doing rapid development on the rest of the script, uncomment
    # this to skip the email search each time:
    #
    # if list_path.exists():
    #     return list_path

    q = 'subject:"Weekly Ting Monitoring Report"'
    print(q)
    results = service.users().messages().list(
        userId='me', q=q, maxResults=500,
    ).execute()

    messages = results.get('messages', [])

    if not messages:
        print('No messages found.')
        return

    print(f'Found {len(messages)} messages:')

    with list_path.open('w') as f:
        f.write(''.join(f'{m["id"]}\n' for m in messages))

    return list_path

def get_messages(service, cache_dir, list_path):
    message_ids = [line.strip() for line in list_path.open()]
    messages = service.users().messages()

    for message_id in message_ids:
        path = cache_dir / f'message-{message_id}'
        if path.is_file():
            continue
        print(f'Get message {message_id}')
        m = messages.get(userId='me', id=message_id, format='raw').execute()
        with open(path, 'wb') as f:
            f.write(urlsafe_b64decode(m['raw']))

img_url_pattern = re.compile(
    rb'https://engage\.ting\.whiskerlabs\.com/static/.*?\.png'
)

offsets = {day_abbr: dt.timedelta(days=i)
           for i, day_abbr
           in enumerate('Sun Mon Tue Wed Thu Fri Sat'.split())}

def get_chart_urls(cache_dir):
    paths = cache_dir.glob('message-*')
    parser = Parser(policy=default)
    for path in paths:
        raw = path.open().read()
        email = parser.parsestr(raw)
        text = email.get_payload(decode=True)
        urls = img_url_pattern.findall(text)
        for url in urls:
            yield url.decode('ascii')

def download_charts(cache_dir, chart_urls):
    for url in chart_urls:
        parts = url.split('/')
        date = dt.datetime.strptime(parts[4], '%Y%m%d').date()
        dow_name, extension = parts[-1].split('.')
        date += offsets[dow_name]
        path = cache_dir / f'chart-{date}.{extension}'
        if not path.exists():
            print(url)
            urllib.request.urlretrieve(url, path)
        yield path

if __name__ == '__main__':
    main()
