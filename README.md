homedir
=======

The home directory dotfiles and customizations of Brandon Rhodes.

I check this out into a new home directory and set it up like this
(omitting the "ubuntu" step if I am on another operating system):

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

For years I kept the contents of my version-controlled home directory
dotfiles a closely-guarded secret.  Which was probably not a bad idea.
At the time, my shell scripts and dotfiles did contain quite a few hints
about how I secured the various connections that I could make between
all of the systems to which I had access at Georgia Tech.  But over the
last decade my digital life has become streamlined, simplified, and far
more standard — I now get to use `ssh` for every single off-machine
connection that I make!

So when the moment came last week that I wanted to create a shell
account on my wife's desktop Mac, I looked over the files that I was
about to check out into `~` and realized two things.

First, none of them really contained secrets any more, or at least could
be easily edited to remove them.

Second, it was a hassle to set up the credentials on the Mac that would
make it possible to access the private repository where my dotfiles were
hidden away.  This had also been a problem when wanting to check out my
dotfiles on public machines, like my Webfaction account.

So I decided to make my dotfiles public — I myself will be able to get
to them more easily, and anyone else who might be curious can mine them
for hints and tibits of wisdom about smoothing away the rough edges of
the Unix environment.

Enjoy, and please consider all of these files to be MIT-licensed: take
whatever you can use, and good luck!

*— Brandon Rhodes, August 2012*
