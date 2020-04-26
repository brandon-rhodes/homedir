#
# Various useful transforms on the clipboard contents.
#

from subprocess import PIPE, Popen, check_output

def main():
    content = check_output(['xclip', '-o', '-selection', 'clipboard'])
    lcontent = content.lstrip()

    # Convert a TeX formula to an image displaying that formula.

    if lcontent.startswith('$'):
        # $x + y$
        with open('/tmp/tmp.tex', 'w') as f:
            f.write('\\nopagenumbers\n' + content + '\n\\end\n')
        check_output(['tex', 'tmp.tex'], cwd='/tmp')
        check_output(['dvipng', '-D', '150', 'tmp.dvi'], cwd='/tmp')
        check_output(['convert', '-trim', 'tmp1.png', 'tmp2.png'], cwd='/tmp')
        with open('/tmp/tmp2.png') as f:
            data = f.read()
        write(data, 'image/png')
        return

    # Default: turn plain text into HTML using Markdown.

    p = Popen(['pandoc'], stdin=PIPE, stdout=PIPE)
    html, stderr = p.communicate(content)
    if html.startswith('<p>'):
        html = '<p style="margin-top: 0">' + html[3:]
    html = html.replace('<code', '<code style="'
                        'background-color:#eee;'
                        'white-space:pre-wrap;'
                        '"')
    html = html.replace('<pre', '<pre style="'
                        'background-color:#eee;'
                        'padding:0.25em;'
                        'font-size:smaller;'
                        '"')
    #print html
    write(html, 'text/html')

def write(content, content_type):
    cmd = ['xclip', '-selection', 'clipboard', '-t', content_type]
    p = Popen(cmd, stdin=PIPE)
    p.communicate(content)

if __name__ == '__main__':
    main()
