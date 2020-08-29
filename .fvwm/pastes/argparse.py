#!/usr/bin/env python3

import argparse
import sys

def main(argv):
    parser = argparse.ArgumentParser(description=put description here)
    parser.add_argument('integers', metavar='N', type=int, nargs='+',
                        help='an integer for the accumulator')
    parser.add_argument('--sum', dest='accumulate', action='store_const',
                        const=sum, default=max,
                        help='sum the integers (default: find the max)')
    args = parser.parse_args(argv)
    print(args.accumulate(args.integers))

if __name__ == '__main__':
    main(sys.argv[1:])
