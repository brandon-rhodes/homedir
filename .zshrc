# Load oh-my-zsh if available
# git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh

# Use my own zsh completion logic, where provided.

fpath=(~/.zsh-completion $fpath)

# Activate virtual environments automatically when $PWD changes.

__compute_environment_slug () {
    local relative="${PWD#$HOME}"                  # Remove any $HOME prefix
    if [ "$relative" = "$PWD" ] ;then return 1 ;fi # Ignore dirs outside $HOME.
    if [ "$relative" = "" ] ;then return 1 ;fi     # Ignore $HOME itself.
    __environment_slug="${${relative#/}//\//-}"    # "a/b/c" -> "a-b-c"
}
__detect_cd_and_possibly_activate_environment () {
    # The leading underscore in front of $OPWD prevents zsh from using
    # $OPWD as an abbreviation for the current directory in my prompt.

    if [ "_$PWD" = "${OPWD}" ] ;then return ;fi  # Still in same directory.
    OPWD="_$PWD"                                 # Save for next time.
    __activate_environment
}
__activate_environment () {
    if ! __compute_environment_slug; then return ;fi
    if [ "$__environment_slug" = "$__environment_name" ] ;then return ;fi

    if [ ! -x ~/.v/"$__environment_slug"/bin/conda ]
    then
        if [ -f ~/.v/"$__environment_slug"/bin/activate ]
        then
            __environment_name="$__environment_slug"
            source ~/.v/"$__environment_name"/bin/activate
        fi
        return
    fi

    __environment_name="$__environment_slug"

    # Note that the Anaconda "deactivate" cannot quite be trusted to put
    # the $PATH variable back where it was, so we do it ourselves.

    OLDPATH=$PATH
    alias deactivate="source deactivate && unalias deactivate && PATH=$OLDPATH && unset OLDPATH"

    source ~/.anaconda/bin/activate ~/.v/$__environment_name

    # Remove the full path from $PS1, because that is just too verbose.
    # Incidentally, I can never understand this line of code without
    # re-reading the shell substitution documentation.

    PS1=${PS1/\/*\//}
}
,conda-env () {
    if ! __compute_environment_slug
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
    ~/.anaconda/bin/conda create -p ~/.v/$__environment_slug ${packages[*]} &&
    __activate_environment &&
    ,setup-jedi
}
,virtualenv () {
    if ! __compute_environment_slug
    then
        echo "Error: must be in a directory beneath your home directory" >&2
        return 1
    fi
    mkdir -p ~/.v &&
    virtualenv "$@" ~/.v/"$__environment_slug" &&
    __activate_environment &&
    ,setup-jedi
}

# Force the cache of existing commands to be rebuilt each time the
# prompt is displayed, and also turn on whichever environment we enter.

autoload colors && colors
zle_highlight=(default:fg=0,bg=7,bold)

PROMPT="%{$fg_bold[black]$bold%}\$%{$reset_color%} "
RPROMPT2="%{$fg_bold[white]$bg[cyan]%} %~ %{$reset_color%}"

precmd() {
    local color rev stat
    rehash
    __detect_cd_and_possibly_activate_environment
    if ! rev="$(git rev-parse --abbrev-ref HEAD)"
    then
        RPROMPT="$RPROMPT2"
    else
        stat="$(git status --porcelain)"
        stat=":${stat//
/:}"
        if [[ "$stat" =~ ':[^?][^?]' ]]
        then
            color=red
        elif [ "$stat" = ':' ]
        then
            color=green
        else
            color=yellow
        fi
        RPROMPT="%{$fg_bold[white]$bg[$color]%}$rev%{$reset_color%} $RPROMPT2"
    fi
}

# Moving forward by one word should land at the end of the next word,
# not at its beginning.

bindkey "\eF" emacs-forward-word
bindkey "\ef" emacs-forward-word

# And forward-word and backward-word should not consider punctuation to
# be part of a word.

WORDCHARS=

# Prevent "!" characters from being special on the command line, since I
# always use Ctrl-R searching and Emacs command-line editing if I want
# to adjust and re-run a previous command.

unsetopt bang_hist

# If TAB can complete at least a partial word, then zsh by default is
# quite lazy and makes *me* hit TAB again to then see the options that
# remain following the characters it fills in. With this option, it will
# always respond to my TAB by showing the list of completions, whether
# there were a few characters that it went ahead and filled in, or not.
# I noticed this when using my new "clone" command, because typing
# "clone <TAB>" was filling in the common prefix "git@github.com:name/"
# and then making me hit TAB all over again to see the repository names.

unsetopt list_ambiguous

# Install my other customizations.

source ~/.bashrc
