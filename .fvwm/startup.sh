#!/bin/bash
#
# In Xubuntu, open "Settings Manager" -> "System: Session and Startup"
# -> "Application Autostart" and click the "+Add" button to add this
# script as a program that gets run when you log in.  This script will
# try to pause long enough to let the Xubuntu session get settled, then
# will fire up "fvwm" to replace the default window manager and, through
# the "Exec" calls in its "~/.fvwm/fvwm2rc", to get other X settings
# tailored to our preferences.
#
# This script also prevents the autostart logic from giving fvwm extra
# session-related command line options that we are not interest in its
# receiving.

(sleep 7; exec fvwm --replace) &
