#!/usr/bin/env python

from __future__ import print_function

import argparse
import socket
import sys

NUMBERS = '123456789_' * 5

def main(argv):
    parser = argparse.ArgumentParser(description='Receive and display updates')
    parser.add_argument('--live', action='store_true',
                        help='listen to the network for life updates')
    args = parser.parse_args(argv)

    if args.live:
        updates = receiver()
    else:
        updates = iter(TEST_UPDATES)

    display_updates(updates)

def display_updates(updates):
    statuses = {}
    for update in updates:
        uuid, number, result = update
        row = statuses.get(uuid)
        if row is None:
            row = statuses[uuid] = []
        number = int(number)
        if len(row) < number:
            row.extend([' '] * (number - len(row)))
        row[number - 1] = '.' if result == 'successful' else 'X'
        length = 0
        for uuid, row in sorted(statuses.items()):
            print(uuid, ''.join(row))
            length = max(length, len(row))
        print(' ' * len(uuid), NUMBERS[:length])
        print()

def receiver():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('', 12345))
    while True:
        data, address = sock.recvfrom(1024)
        strings = data.decode('utf-8').split()
        yield strings

TEST_UPDATES = [
    ['UUID-1', '1', 'failure'],
    ['UUID-1', '1', 'successful'],
    ['UUID-1', '2', 'failure'],
    ['UUID-2', '1', 'failure'],
    ['UUID-1', '3', 'failure'],
    ['UUID-1', '3', 'successful'],
    ['UUID-2', '1', 'successful'],
    ['UUID-2', '4', 'successful'],
]

if __name__ == '__main__':
    main(sys.argv[1:])
