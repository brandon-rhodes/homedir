# Load oh-my-zsh if available
# git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh

# Use my own zsh completion logic, where provided.

fpath=(~/.zsh-completion $fpath)

# Activate virtual environments automatically when $PWD changes.

,,auto-activate-virtualenv () {
    local relative activate

    # The leading underscore in front of $OPWD prevents zsh from using
    # $OPWD as an abbreviation for the current directory in my prompt.

    if [ "_$PWD" = "${OPWD}" ] ;then return ;fi  # Still in same directory.
    OPWD="_$PWD"

    # We have just changed directories, so consider auto-activating a
    # virtual environment.

    relative="${PWD#$HOME}"
    if [ "$relative" = "$PWD" ] ;then return ;fi  # Outside of $HOME.
    if [ "$relative" = "" ] ;then return ;fi      # In $HOME itself.
    VENV="$HOME/.v/${${relative#/}//\//-}"        # "~/a/b/c" => "~/.v/a-b-c"
    if [ -d "$VENV" ]
    then
        activate="$VENV/bin/activate"
        if [ -f "$activate" ]
        then
            source "$activate"
        else
            ,,conda-activate
        fi
    fi
}
,,conda-activate () {
    local OLD_PS1=$PS1
    source ~/.anaconda/bin/activate "$VENV" &&
    alias conda="~/.anaconda/bin/conda"
    alias deactivate="source ~/.anaconda/bin/deactivate && unalias deactivate && unalias conda"
    PS1="($(basename $VENV))$OLD_PS1"
}
,conda-virtualenv () {
    if [ "$#" = "0" ]
    then
        packages="ipython jinja2 matplotlib pyzmq tornado"
    else
        packages="$@"
    fi
    mkdir -p "$HOME/.v" &&
    ~/.anaconda/bin/conda create -n "$VENV" pip $packages &&
    ,,conda-activate
    # --file =(~/.anaconda/bin/conda list -e | grep -v conda)
}
,virtualenv () {
    mkdir -p "$HOME/.v" &&
    virtualenv "$@" "$VENV" &&
    source "$VENV/bin/activate"
}

# Force the cache of existing commands to be rebuilt each time the
# prompt is displayed.

precmd() {
    rehash
    ,,auto-activate-virtualenv
}

# -------- Oh-my-zsh!

DISABLE_AUTO_UPDATE="true"

if [ -d ~/.oh-my-zsh ]
then

# Path to your oh-my-zsh configuration.
ZSH=$HOME/.oh-my-zsh

# Set name of the theme to load.
# Look in ~/.oh-my-zsh/themes/
# Optionally, if you set this to "random", it'll load a random theme each
# time that oh-my-zsh is loaded.
# ZSH_THEME="clean"

# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# Set to this to use case-sensitive completion
CASE_SENSITIVE="true"

# Comment this out to disable weekly auto-update checks
# DISABLE_AUTO_UPDATE="true"

# Uncomment following line if you want to disable colors in ls
# DISABLE_LS_COLORS="true"

# Uncomment following line if you want to disable autosetting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment following line if you want red dots to be displayed while waiting for completion
# COMPLETION_WAITING_DOTS="true"

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
plugins=(git python)

source $ZSH/oh-my-zsh.sh

# Customize to your needs...

PROMPT='%{$fg[black]%}%B%m%(!.#.$)%b%{$reset_color%} '
RPROMPT='$(git_prompt_info) %{$fg[blue]%}%B%~%b%{$reset_color%}'

# git theming
ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg_bold[blue]%}(%{$fg_no_bold[yellow]%}%B"
ZSH_THEME_GIT_PROMPT_SUFFIX="%b%{$fg_bold[blue]%})%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_CLEAN=""
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg_bold[red]%}*"

# -------- End of Oh-my-zsh configuration

# Even though our .bashrc unsets this, by this point it has been set again:

unset HISTFILE

# Moving forward by one word should land at the end of the next word,
# not at its beginning.

bindkey "\eF" emacs-forward-word
bindkey "\ef" emacs-forward-word


# Oh-my-zsh sets M-l so that it runs the "ls" command.  Emacs disagrees,
# and so my fingers disagree as well.

bindkey "\el" down-case-word

# Not every change of directory should be allowed to spam my pushd/popd
# stack.

unsetopt autopushd

# Prevent "!" characters from being special on the command line, since I
# always use Ctrl-R searching and Emacs command-line editing if I want
# to adjust and re-run a previous command.

unsetopt bang_hist

# Autocorrection keeps trying to correct subcommand names to filenames.

unsetopt correct_all

# If TAB can complete at least a partial word, then zsh by default is
# quite lazy and makes *me* hit TAB again to then see the options that
# remain following the characters it fills in. With this option, it will
# always respond to my TAB by showing the list of completions, whether
# there were a few characters that it went ahead and filled in, or not.
# I noticed this when using my new "clone" command, because typing
# "clone <TAB>" was filling in the common prefix "git@github.com:name/"
# and then making me hit TAB all over again to see the repository names.

unsetopt list_ambiguous

# The default oh-my-zsh "matcher-list" does crazy things like try to
# complete the end of the current word even if my cursor is still in the
# middle of an ambiguous part of the string. And its attempt to go ahead
# and fill in the common suffix shared by all current completions tends
# to just produce a broken word, such that pressing TAB again produces
# no further valid completions. So I here restore "matcher-list" to its
# plain default value.

zstyle ':completion:*' matcher-list ''

fi

# Install my other customizations.

source ~/.bashrc
