#!/bin/bash
#
# usage: decide-window-border.sh w.id w.width w.height vp.width vp.height
#
# I at first attempted to inline this script into the FVWM config file,
# but trying to quote its content correctly led me into a maze of twisty
# passages.  It tests whether a window is the same size, or very nearly
# the same size, as the viewport.  If so, the window's border is taken
# away.  Otherwise, the window's border is turned on.

# When the mouse crosses the edge of the screen and flips us to a new
# viewport, there is, for a moment, no current window, and fvwm will
# have passed us the literal string "$[w.id]".

if [ "$1" = '$[w.id]' ]
then
    echo Echo No current window
    exit
fi

w_id="$1"
w_width="$2"
w_height="$3"
vp_width="$4"
vp_height="$5"

if (( $w_width + 8 >= $vp_width && $w_height + 8 >= $vp_height ))
then
    echo Echo YES $w_id
    echo "Style (WindowId $w_id) !Borders"
else
    echo Echo NO $w_id
    echo "Style (WindowId $w_id) Borders"
fi
