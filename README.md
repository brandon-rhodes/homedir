homedir
=======

This repository contains the home directory dotfiles and customizations
of Brandon Rhodes.  You might also be interested in taking a look at his
version-controlled `.emacs.d` directory at:

https://github.com/brandon-rhodes/dot-emacs

When I am setting up a shell account on a new machine, I check this
`homedir` repository out into my new home directory and set it up like
this (omitting the "ubuntu" step if I am on another operating system):

    $ cd
    $ git co https://github.com/brandon-rhodes/homedir.git
    $ mv homedir/.[Xa-z]* homedir/* .
    $ rmdir homedir
    $ bin/,setup-ubuntu
    $ bin/,setup-home-usr
    $ bin/,setup-zsh

I carefully log in using `ssh` in another terminal window — to make sure
that the dotfiles leave me able to connect — and then change my default
shell to `/bin/zsh` with `chsh` and am off and running.

Note that many custom commands in `~/bin` have names that start with a
comma, as do most of my shell aliases.  This unique leading character
keeps them orthogonal from real system commands, preventing any future
name collisions as new commands are invented in the Unix world.  Plus, I
can type a comma and then press Tab in my shell to see a list of all of
my custom scripts.

I have made all of these dotfiles public so I can download them more
easily, and so that anyone else who is curious can mine them for hints
and tidbits of wisdom about smoothing away the rough edges of the Unix
environment.

Enjoy, and please consider all of these files to be MIT-licensed: take
whatever you can use, and good luck!

*— Brandon Rhodes*
