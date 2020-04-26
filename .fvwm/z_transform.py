#!/usr/bin/env python3
#
# Various useful transforms on the clipboard contents.
#

import re
from subprocess import PIPE, Popen, check_output

def main():
    raw = check_output(['xclip', '-o', '-selection', 'clipboard'])
    text = raw.decode('utf-8').strip()

    # Convert a TeX formula to an image displaying that formula.

    if text.startswith('$'):
        # $x + y$
        with open('/tmp/tmp.tex', 'w') as f:
            f.write('\\nopagenumbers\n' + text + '\n\\end\n')
        check_output(['tex', 'tmp.tex'], cwd='/tmp')
        check_output(['dvipng', '-D', '150', 'tmp.dvi'], cwd='/tmp')
        check_output(['convert', '-trim', 'tmp1.png', 'tmp2.png'], cwd='/tmp')
        with open('/tmp/tmp2.png', 'rb') as f:
            data = f.read()
        write(data, 'image/png')
        return

    # Default: turn plain text into HTML using Markdown.

    p = Popen(['pandoc'], stdin=PIPE, stdout=PIPE)
    html, stderr = p.communicate(raw)
    if html.startswith(b'<p>'):
        html = b'<p style="margin-top: 0">' + html[3:]
    html = html.replace(b'<code', b'<code style="'
                        b'background-color:#eee;'
                        b'white-space:pre-wrap;'
                        b'"')
    html = html.replace(b'<pre', b'<pre style="'
                        b'background-color:#eee;'
                        b'padding:0.25em;'
                        b'font-size:smaller;'
                        b'"')
    #print html
    write(html, 'text/html')

def write(content, content_type):
    if isinstance(content, str):
        content = content.encode('utf-8')
    cmd = ['xclip', '-selection', 'clipboard', '-t', content_type]
    p = Popen(cmd, stdin=PIPE)
    p.communicate(content)

if __name__ == '__main__':
    main()
