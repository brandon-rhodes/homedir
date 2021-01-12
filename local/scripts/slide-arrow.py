import time
import sys
import datetime as dt
COLUMNS = 34
start = dt.datetime(2019, 4, 5, 15, 00)
minutes_long = 25
while True:
    seconds = (dt.datetime.now() - start).total_seconds()
    columns = int(seconds * COLUMNS / 60 / minutes_long)
    sys.stdout.write('\033[2J')
    sys.stdout.write('\033[H')
    sys.stdout.write('\n' * columns)
    sys.stdout.write('<---- %s' % seconds)
    sys.stdout.flush()
    time.sleep(1)
