#
# Various useful transforms on the clipboard contents.
#

from subprocess import PIPE, Popen, check_output

def main():
    content = check_output(['xclip', '-o', '-selection', 'clipboard'])
    lcontent = content.lstrip()
    print repr(content)
    if lcontent.startswith('D') and lcontent[1:].isdigit():
        write(
            '<a href="https://example.com/{}">{}</a>'
            .format(lcontent, lcontent),
            'text/html',
        )
        return
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
    # Default: markdown
    p = Popen(['pandoc'], stdin=PIPE, stdout=PIPE)
    # (Example of debugging problem:)
    html, stderr = p.communicate(content)
    write(html, 'text/html')

def write(content, content_type):
    cmd = ['xclip', '-selection', 'clipboard', '-t', content_type]
    p = Popen(cmd, stdin=PIPE)
    p.communicate(content)

if __name__ == '__main__':
    main()
