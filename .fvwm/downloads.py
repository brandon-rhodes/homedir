#!/usr/bin/env python3

import argparse
import sys

def main(argv):
    parser = argparse.ArgumentParser(
        description='Commands for FVWM Win+D menu',
    )
    subparsers = parser.add_subparsers(dest='action', required=True)

    subparsers.add_parser('menu', help='Print menu of options')

    args = parser.parse_args(argv)

    if args.action == 'menu':
        menu()

HEAD = 5

def menu():
    from pathlib import Path
    target_dir = Path("/home/brandon/Downloads")
    files = [f for f in target_dir.iterdir() if f.is_file()]
    files.sort(key=lambda x: x.stat().st_mtime)
    for n, f in enumerate(files[-HEAD:], 1):
        name = f.name
        print(f'+ "&{n}  {name}" Exec exec /home/brandon/bin/open \'{f}\'')
    print('+ "" Nop')
    print('+ "&d  De-duplicate (not yet implemented)" Nop')

if __name__ == '__main__':
    main(sys.argv[1:])
