#!/usr/bin/env python3

import os
import subprocess

def main():
    office = fetch_reading('office')
    basement = fetch_reading('basement')
    # print(office)
    # print(basement)

    status = template.format(
        basement['F'], office['F'], office['CO2_ppm'],
        basement['H%'], office['H%'],
    )

    save_output(status)

template = """
 Basement  Office
 {:3}°F    {:3}°F    {:>4} CO₂PPM
 {:4}% RH  {:4}% RH

"""

def fetch_reading(hostname):
    command = 'ls data-* | tail -1 | xargs cat | tail -1'
    result = subprocess.run(
        ['ssh', hostname, command],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    out = result.stdout
    if result.returncode:
        raise RuntimeError(result.stdout)
    return dict(s.split('=') for s in out.split()[2:])

def save_output(text):
    with open('.status.new', 'w') as f:
        f.write(text)

    os.rename('.status.new', '.status')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        save_output(str(e))
        exit(1)
