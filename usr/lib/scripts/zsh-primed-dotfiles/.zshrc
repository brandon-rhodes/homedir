# For the use of ~/bin/,zsh-primed

# Load the user's normal interactive zsh configuration.
unset ZDOTDIR
source ~/.zshrc

# Add the command to the command line history.
print -sr "$COMMAND"

# Run the command.
eval $COMMAND
