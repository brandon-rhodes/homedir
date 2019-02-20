# Load oh-my-zsh if available
# git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh

# Quick abbreviations for very common redirections.

alias -g ,1='2>&1'
alias -g ,2='2>/dev/null'

# Use my own zsh completion logic, where provided.

fpath=(~/.zsh-completion $fpath)
compdef s=ssh

# Activate virtual environments automatically when $PWD changes.

__compute_environment_slug () {
    local relative="${PWD#$HOME}"                  # Remove any $HOME prefix
    if [ "$relative" = "$PWD" ] ;then return 1 ;fi # Ignore dirs outside $HOME.
    if [ "$relative" = "" ] ;then return 1 ;fi     # Ignore $HOME itself.
    echo "${${relative#/}//\//-}"                  # "a/b/c" -> "a-b-c"
}
__detect_cd_and_possibly_activate_environment () {
    if [ "$PWD" = "$OPWD" ]
    then return
    fi
    OPWD="$PWD"
    local slug
    if slug="$(__compute_environment_slug)"
    then
        if [ "$slug" != "$ENV_SLUG" -a -d ~/.v/"$slug" ]
        then
            local PROMPT  # protect from "activate", "deactivate"
            if [ -n "$VIRTUAL_ENV" ]
            then
                deactivate
            elif [ -n "$CONDA_DEFAULT_ENV" ]
            then
                source deactivate
            fi
            source ~/.v/"$slug"/bin/activate ~/.v/"$slug"
            ENV_PATH="$PWD"
            ENV_SLUG="$slug"
        fi
    fi
    local tail=${PWD#$ENV_PATH}
    if [ "$tail" = "$PWD" ]
    then tail="%~"
    fi
    if [ -n "$ENV_SLUG" ]
    then tail="($ENV_SLUG)$tail"
    fi
    base_RPROMPT="%{$fg_bold[white]$bg[cyan]%} $tail %{$reset_color%}"
}
,conda-env () {
    local slug
    if ! slug=$(__compute_environment_slug)
    then
        echo "Error: must be in a directory beneath your home directory" >&2
        return 1
    fi
    if [ "$#" = "0" ]
    then
        packages=( ipython-notebook matplotlib pandas pip )
    else
        packages=( "$@" pip )
    fi
    mkdir -p ~/.v &&
    ~/.anaconda/bin/conda create -y -p ~/.v/$slug ${packages[*]} &&
    unset OPWD &&
    __detect_cd_and_possibly_activate_environment &&
    ,setup-jedi
}
,virtualenv () {
    local slug
    if ! slug=$(__compute_environment_slug)
    then
        echo "Error: must be in a directory beneath your home directory" >&2
        return 1
    fi
    mkdir -p ~/.v &&
    ~/usr/src/virtualenv/virtualenv.py "$@" ~/.v/"$slug" &&
    unset OPWD &&
    __detect_cd_and_possibly_activate_environment &&
    ,setup-jedi
}

# Build a pretty prompt.

if [ -z "$TERM" -o "$TERM" = "dumb" ]
then
    # Avoid "^[[?2004h" after each prompt when running inside of Emacs.
    unset zle_bracketed_paste
else
    autoload -Uz bracketed-paste-magic
    zle -N bracketed-paste bracketed-paste-magic

    autoload -Uz url-quote-magic
    zle -N self-insert url-quote-magic

    autoload colors && colors
    zle_highlight=(default:fg=0,bg=7,bold)

    if [ -z "$SSH_TTY" ]
    then
        base_PROMPT="%{$fg_bold[black]$bold%}\$%{$reset_color%} "
    else
        PS1="${HOST:-${HOSTNAME}}"

        # Keep only the first component of a fully-qualified hostname.
        PS1="${PS1%%.*}"

        base_PROMPT="%{$fg_bold[black]$bold%}$PS1\$%{$reset_color%} "
    fi
    base_RPROMPT="%{$fg_bold[white]$bg[cyan]%} %~ %{$reset_color%}"

    start_time=$SECONDS

    preexec() {
        start_time=$SECONDS
    }

    precmd() {
        local color elapsed rev root status_lines
        rehash
        __detect_cd_and_possibly_activate_environment
        root=$(git rev-parse --show-toplevel 2>/dev/null)

        PROMPT="$base_PROMPT"

        if [ -n "$start_time" ]
        then
            elapsed=$(($SECONDS - $start_time))
            unset start_time
            if [ $(( $elapsed >= 5 )) = "1" ]
            then
                elapsed=$(printf "%d:%02d\n" $(($elapsed / 60)) $(($elapsed % 60)))
                PROMPT="$elapsed $PROMPT"
            fi
        fi

        RPROMPT="$base_RPROMPT"
        if [ -n "$root" ]
        then
            if [ -f "$root/.git/no-prompt" ]
            then
                # Too expensive to run "status" each time.
                color=blue
            else
                status_lines="$(git status --porcelain)"
                status_lines=":${status_lines//
/:}"                            # delimit the lines with colons instead
                if [[ "$status_lines" =~ ':[^?][^?]' ]]
                then color=red
                elif [ "$status_lines" = ':' ]
                then color=green
                else color=yellow
                fi
            fi
            rev="$(git rev-parse --abbrev-ref HEAD)"
            RPROMPT="%{$fg_bold[white]$bg[$color]%}$rev%{$reset_color%} $RPROMPT"
        fi
    }
fi

# Moving forward by one word should land at the end of the next word,
# not at its beginning.

bindkey "\eF" emacs-forward-word
bindkey "\ef" emacs-forward-word

# An easy keyboard shortcut to edit a long complicated command in my editor.

autoload -z edit-command-line
zle -N edit-command-line
bindkey "^Xe" edit-command-line

# And forward-word and backward-word should not consider punctuation to
# be part of a word.

WORDCHARS=

# Prevent "!" characters from being special on the command line, since I
# always use Ctrl-R searching and Emacs command-line editing if I want
# to adjust and re-run a previous command.

unsetopt bang_hist

# Prevent duplicate commands from filling history.

setopt hist_ignore_dups

# Don't complain if I paste part of a shell script into the command
# line, and some lines start with '#'.  They are comments!  I'm not
# trying to run the program '#'!

setopt interactivecomments

# If TAB can complete at least a partial word, then zsh by default is
# quite lazy and makes *me* hit TAB again to then see the options that
# remain following the characters it fills in. With this option, it will
# always respond to my TAB by showing the list of completions, whether
# there were a few characters that it went ahead and filled in, or not.
# I noticed this when using my new "clone" command, because typing
# "clone <TAB>" was filling in the common prefix "git@github.com:name/"
# and then making me hit TAB all over again to see the repository names.

unsetopt list_ambiguous

# Don't ring the terminal bell during completion.

setopt no_beep

# During completion, allow moving through the menu with arrow keys.

zstyle ':completion:*' menu select

# Install my other customizations.

source ~/.bashrc
