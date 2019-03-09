# Environment script.

source $HOME/.bashenv

# Command-line programs that need to invoke our editor should run our
# quick "emacs-no-window" script, so that Emacs runs in text mode right
# at the terminal instead of taking the time to open a separate window.

export EDITOR=$HOME/bin/enw

# There should also be a quick way to launch the most graphical version
# of Emacs available.  A job spawned from a sub-shell neither gets
# enrolled in our jobs table, nor dies with the shell's terminal.  If
# the current directory is listed in ~/.python-paths then the PYTHONPATH
# value that follows it on the line is automatically set, to give me a
# per-project ability to help Jedi find all relevant Python modules.

e () {
    local pp
    if [ -n "$PYTHONPATH" ] ;then
        pp="$PYTHONPATH"
    elif [ -f $HOME/.python-paths ] ;then
        pp="$(grep "^$PWD " $HOME/.python-paths | sed 's/^[^ ]* //')"
    fi
    if [ -n "$DISPLAY" -a -x /usr/bin/emacs ] ;then
        (PYTHONPATH="$pp" /usr/bin/emacs "$@" &)
    elif [ -n "$DISPLAY" -a -x $HOME/usr/bin/emacs ] ;then
        (PYTHONPATH="$pp" $HOME/usr/bin/emacs "$@" &)
    else
        PYTHONPATH="$pp" $HOME/bin/enw "$@"
    fi
}

# Go ahead and keep commands with leading whitespace in the shell
# history (as the leading whitespace is, in my case, never significant
# and always the result of an overly generous cut-and-paste), but do
# erase duplicates.

HISTCONTROL=erasedups

# For security, bash should never save command history to disk under one
# of my main accounts.  But saving history is okay inside a VM and,
# actually, kind of convenient, because of how often one logs out and
# back in and needs to run verbose and cumbersome boilerplate commands.

if [ "$LOGNAME" != "vagrant" ]
then unset HISTFILE
fi

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

alias a="ag -i"
alias la="/bin/ls -avCF"
alias lf="/bin/ls -vCF"
alias ll="/bin/ls -lv"
alias lla="/bin/ls -alv"
alias ltr="/bin/ls -ltr"
alias ltra="/bin/ls -ltra"
alias m="less"
alias o="open"
alias vl="git diff-vs-master --name-only"
alias vs="git diff-vs-master"

clone() { git clone; }  # see ~/.zsh-completions/_clone for the magic
d () {
    if [ -t 1 ]
    then $DIFF -ur "$@" 2>&1 | less
    else $DIFF -ur "$@"
    fi
}
function g {
    grep -E --color=always "$@" 2>/dev/null | less -FRX
}
gi () {
    # Correct something like "gi tstatus" to "git status".
    arg1="$1"
    shift
    gi${arg1:0:1} ${arg1:1} "$@"
}
j () {
    jq . "$@" | less
}
,q () {
    if [ -z "$1" ]
    then git commit -m 'quick commit' .
    else git commit -m 'quick commit' "$@"
    fi
}
wd () {
    diff -u "$@" | wdiff -d -n -w $'\033[1;31;47m' -x $'\033[0m' \
                               -y $'\033[1;32;47m' -z $'\033[0m'
}

# A convenient way to turn core dumping on and off.  Note the leading
# comma, which keeps these one-off commands completely orthogonal to
# actual commands installed on the system; the same convention is
# followed in my ~/bin directory.

alias ,coreon="ulimit -c unlimited"
alias ,coreoff="ulimit -c 0"

# Be careful to run X server with "exec" so I get logged out when it exits.

alias ,startx="exec startx"

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
