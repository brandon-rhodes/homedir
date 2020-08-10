#!/usr/bin/env python3
#
# Various useful transforms on the clipboard contents.
#
import codecs
from subprocess import PIPE, Popen, check_output

def main():
    text = read()
    text = codecs.encode(text, "rot13" )
    write(text, 'text/plain')

def read():
    raw = check_output(['xclip', '-o', '-selection', 'clipboard'])
    return raw.decode('utf-8').strip()

def write(content, content_type):
    if isinstance(content, str):
        content = content.encode('utf-8')
    cmd = ['xclip', '-selection', 'clipboard', '-t', content_type]
    p = Popen(cmd, stdin=PIPE)
    p.communicate(content)

if __name__ == '__main__':
    main()
