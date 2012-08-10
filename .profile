# Bash login shells do not read the bashrc, so we call it manually.

if [ -n "$BASH" ]
then
    source ~/.bashrc
fi
