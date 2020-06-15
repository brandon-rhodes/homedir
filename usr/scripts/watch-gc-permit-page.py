#!/usr/bin/env python3

import os
import sys
from urllib.request import urlopen
from time import sleep

message = (b'NO NEW OVERNIGHT CAMPING PERMITS FOR THE INNER CANYON'
           b' WILL BE ISSUED AT THIS TIME')

def main(argv):
    while True:
        check()
        sleep(3600)  # one hour

def check():
    u = urlopen(
        'https://www.nps.gov/grca/planyourvisit/backcountry-permit.htm'
    )
    text = u.read()
    if message in text:
        return
    os.system('notify-send -t 3500000'
              ' "Check the\nGrand Canyon backcounty\npermit page!"')

if __name__ == '__main__':
    main(sys.argv[1:])
