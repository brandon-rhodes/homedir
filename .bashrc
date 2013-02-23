# Command-line programs that need to invoke our editor should run our
# quick "emacs-no-window" script, so that Emacs runs in text mode right
# at the terminal instead of taking the time to open a separate window.

export EDITOR=$HOME/bin/enw

# Grep should use color to draw my eye to matches.

export GREP_OPTIONS='--color=auto'

# Bash should never save command history to disk.

unset HISTFILE

# Use Unicode if available.

if LANG=en_US.UTF-8 locale charmap 2>/dev/null | grep -q '^UTF-8$'
then
    export LANG=en_US.UTF-8
fi

# An excellent pager is of the utmost importance to the Unix experience.

export LESS="-i -j.49 -M -R -z-2"
export PAGER=less

# One Unicode feature is unfortunate: its official collation method
# mixes capitalized filenames in amongst lower-case filenames, breaking
# the traditional Unix assumption that capitalized meta-files like
# Makefile and README will be listed first.  So we ask programs to
# revert to a bare 8-bit encoding when doing collation.

export LC_COLLATE=C

# Prepend my home bin directories to the path if not there already.

if [[ ":$PATH:" != *":$HOME/usr/bin:"* ]]
then PATH="$HOME/usr/bin:$PATH"
fi

if [[ ":$PATH:" != *":$HOME/bin:"* ]]
then PATH="$HOME/bin:$PATH"
fi

# The prompt should name the system on which the shell is running, in
# bold so the eye can easily find prompts when scrolling, and also turn
# red if it is a root prompt.

if [ -n "$HOST" ]
then
    bash_prompt="$HOST"
else
    bash_prompt="$HOSTNAME"
fi

if [ "$USER" = "root" ]
then
    bash_prompt=${bash_prompt}"# "
else
    bash_prompt=${bash_prompt}"\$ "
fi

if [ -n "$TERM" ]
then
    # Everyone gets bold.
    bash_prompt="\[$(tput bold)\]$bash_prompt\[$(tput sgr0)\]"

    if [ "$(id -u)" = "0" ]
    then
        # Root additionally gets red.
        bash_prompt="\[$(tput setaf 1)\]$bash_prompt"
    fi
fi

# Bash-only feature.
PROMPT_COMMAND='PS1="$bash_prompt"'

# Bash should wait forever at its prompt and never time out.

unset TMOUT

# The virtualenv Python tool should always use "distribute" as its
# packaging back-end.

export VIRTUALENV_USE_DISTRIBUTE=1

# A quick way to put all of the Python versions compiled under ~/battery
# on to my PATH, with their shared libraries also visible.

,battery () {
    PATH=~/battery/usr/bin:$PATH
    export LD_LIBRARY_PATH=~/battery/usr/lib
}

# Various shell aliases, some quite traditional: "la" and "ll" go back
# to very early versions of Unix, where you could hard-link "ls" to
# either of those names and get the associated option automatically!

if [ -x /usr/bin/colordiff ] ;then DIFF=colordiff ;else DIFF=diff ;fi

alias la="/bin/ls -aCF"
alias lf="/bin/ls -CF"
alias ll="/bin/ls -l"
alias lla="/bin/ls -la"
alias d="$DIFF -ur"
alias g="grep"
alias m="less"
alias s="ssh"
clone() { git clone; }  # see ~/.zsh-completions/_clone for the magic
wd() {
    diff -u "$@" | wdiff -d -n -w $'\033[1;31;47m' -x $'\033[0m' \
                               -y $'\033[1;32;47m' -z $'\033[0m'
}

# A convenient way to turn core dumping on and off.  Note the leading
# comma, which keeps these one-off commands completely orthogonal to
# actual commands installed on the system; the same convention is
# followed in my ~/bin directory.

alias ,coreon="ulimit -c unlimited"
alias ,coreoff="ulimit -c 0"

# Bash should update the LINES and COLUMNS environment variables each
# time the terminal window gets resized, for programs that care.

if [ -n "$BASH" ]
then shopt -s checkwinsize
fi

# The tty should not intercept Control-S (stop) or Control-Q (start).

stty -ixon

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

# Set my umask depending on whether it looks like I own my group.

if [ "$(id -un)" = "$(id -gn)" ]
then umask 027
else umask 077
fi

# Load bash completion customization, if available.

if [ -n "$BASH" -a -f /etc/bash_completion ]
then
    source /etc/bash_completion
fi

# Load any site-specific commands that I have defined.

if [ -f ~/.localrc ]
then
    source ~/.localrc
fi

# Run any commands specified in the environment variable PRERUN, so that
# FVWM can open xterms that run a command before giving me control.

if [ -n "$PRERUN" ]; then
    eval "$PRERUN"
    unset PRERUN
fi
