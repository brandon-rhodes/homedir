# Environment script.

source $HOME/.bashenv

# Command-line programs that need to invoke our editor should run our
# quick "emacs-no-window" script, so that Emacs runs in text mode right
# at the terminal instead of taking the time to open a separate window.

export EDITOR=$HOME/bin/enw

# Stop Emacs from trying to use its own color scheme in the terminal.
# It should use the terminal's 16 color theme instead.

unset COLORTERM

# A quick way to launch Emacs, opening the current directory if no
# command line arguments are offered.

e () {
    if [ -z "$*" ] ;then
        set .
    fi
    (emacs "$@" &)
}

# Go ahead and keep commands with leading whitespace in the shell
# history (as the leading whitespace is, in my case, never significant
# and always the result of an overly generous cut-and-paste), but do
# erase duplicates.

HISTCONTROL=erasedups

# Never save history to disk, both because it feels vaguely insecure,
# and because the history would be a crazy interleaving of commands from
# the dozen or more shells that I have open at any given time.

unset HISTFILE

# Keep plenty of history to avoid having to retype commands.

HISTSIZE=12000

# An excellent pager is of the utmost importance to the Unix experience.

export LESS="-i -j.49 -M -R -z-2"
export PAGER=less

# Put Emacs for Mac OS X in front of its terrible ancient Emacs.

if [ -d /Applications/Emacs.app/Contents/MacOS/bin ]
then
    if [[ ":$PATH:" != *":/Applications/Emacs.app/Contents/MacOS/bin:"* ]]
    then
        PATH="/Applications/Emacs.app/Contents/MacOS:$PATH"
        PATH="/Applications/Emacs.app/Contents/MacOS/bin:$PATH"
    fi
fi

# Display my username and hostname in the xterm titlebar.

if [ "$TERM" = "xterm" ]
then
    echo -ne "\033]0;$USER@$HOST\007"
fi

# The prompt should name the system on which the shell is running, in
# bold so the eye can easily find prompts when scrolling, and also turn
# red if it is a root prompt.

if [ -t 0 -a -z "$ZSH_VERSION" ]
then
    PS1="${HOST:-${HOSTNAME}}"

    # Keep only the first component of a fully-qualified hostname.
    PS1="${PS1%%.*}"

    if [ "$USER" = "root" ]
    then
        PS1="${PS1}#"
    else
        PS1="${PS1}\$"
    fi
    if [ -n "$TERM" -a "$TERM" != "dumb" ]
    then
        # Bold and colorful, with root in red and others in yellow.
        PS1="$(tput bold; tput setab 7)\]$PS1\[$(tput sgr0)\]"
        if [ "$USER" = "root" ]
        then
            PS1="\[$(tput setaf 1)$PS1"
        else
            PS1="\[$(tput setaf 3)$PS1"
        fi
    fi
    PS1="${PS1} "
fi

# Bash should wait forever at its prompt and never time out.

unset TMOUT

# Various shell aliases, some quite traditional: "la" and "ll" go back
# to very early versions of Unix, where you could hard-link "ls" to
# either of those names and get the associated option automatically!

if [ -x /usr/bin/colordiff ] ;then DIFF=colordiff ;else DIFF=diff ;fi

alias c="$HOME/local/containers/generic/run"
alias la="/bin/ls -avCF"
alias lf="/bin/ls -vCF"
alias ll="/bin/ls -lv"
alias lla="/bin/ls -alv"
alias ltr="/bin/ls -ltrF"
alias ltra="/bin/ls -ltra"
alias m="less"
alias o="open"
alias vs="git diff-vs-master"
alias xargs="xargs -d '\n'"  # I never put multiple filenames on one line

d () {
    if [ -t 1 ]
    then $DIFF -ur "$@" 2>&1 | less
    else $DIFF -ur "$@"
    fi
}
function g {               # formerly 'grep', but wanted --smart-case
    pattern="$1"
    shift
    rg --line-buffered --max-columns=1000 --no-ignore-vcs --smart-case \
       --sort path "$pattern" "${@:--}" | less -FRX
}
function a {               # formerly 'ag', so muscle memory is 'a' not 'r'
    rg --line-buffered --max-columns=1000 --no-ignore-vcs --smart-case \
       --sort path "$@"
}
gi () {
    # Correct something like "gi tstatus" to "git status".
    arg1="$1"
    shift
    gi${arg1:0:1} ${arg1:1} "$@"
}
,w () {
    ,watch python3 "$@" --
}

# A convenient way to turn core dumping on and off.  Note the leading
# comma, which keeps these one-off commands completely orthogonal to
# actual commands installed on the system; the same convention is
# followed in my ~/bin directory.

alias ,coreon="ulimit -c unlimited"
alias ,coreoff="ulimit -c 0"

# Read AWS credentials for Boto from our ~/.s3cfg file.

,aws() {
    export AWS_ACCESS_KEY_ID=$(awk '/^access_key / {print $3}' ~/.s3cfg)
    export AWS_SECRET_ACCESS_KEY=$(awk '/^secret_key / {print $3}' ~/.s3cfg)
}

# Bash-specific settings.

if [ -n "$BASH" ]
then

    # Update the LINES and COLUMNS environment variables each time the
    # terminal window gets resized, for programs that care.
    shopt -s checkwinsize

    # The `**` pattern in a glob should match any number of directories.
    shopt -s globstar

fi

# Faster C builds.  Maybe I'll forget this is set globally, and it'll
# get me into trouble someday?  We'll see!

if [ -x /usr/bin/ccache ]
then
    export CC="ccache cc"
fi

# The tty should not intercept Control-S (stop) or Control-Q (start).

if [ -t 0 ]
then stty -ixon
fi

# Do not produce core dumps by default.

ulimit -c 0

# Prevent Ubuntu from doing a painstaking search of its package database
# every time I misspell a command.

if [ -n "$BASH" ]
then unset -f command_not_found_handle
fi

# Turn off history expansion; I use interactive search and quick Emacs
# edits instead, so I only ever invoke the history syntax accidentally!

unset histchars

# Load bash completion customization, if available.

if [ -n "$BASH" -a -f /etc/bash_completion ]
then
    source /etc/bash_completion
fi

# Load any site-specific setup I have defined.

if [ -f "$HOME/.localrc" ]
then source "$HOME/.localrc"
fi
