#
# X Windows startup file.
#

echo
echo .xinitrc starting at "$(date --rfc-3339=seconds)"
echo

# Make sure that all child processes inherit my standard environment.

source .bashrc

# Allow local customization.

LOCK_TIMEOUT=5

if [ -f $HOME/.xinitrc-local ]
then
    source $HOME/.xinitrc-local
fi

# Establish my default X Windows settings.

$HOME/bin/,xset

# Hardware configuration for my "guiness" laptop.

if [ "$(hostname)" == "guinness" ]
then
    xrandr --dpi 96

    # Turn off touchpad taps, since they are always accidental.

    xinput --set-prop "AlpsPS/2 ALPS DualPoint TouchPad" \
	"Synaptics Tap Action" 0 0 0 0 0 0 0
fi

# Turn off the touchpad on my ThinkPad T430, since I rely on its eraser
# joystick and hardware buttons instead.

DEVICE="SynPS/2 Synaptics TouchPad"

if xinput --list | grep -q "$DEVICE"
then xinput disable "$DEVICE"
fi

# Start services and applets.

trayer --edge top --align right --width 6 &
autocutsel &
# blueman-applet &
indicator-cpufreq &
nm-applet &
xautolock -time $LOCK_TIMEOUT -locker slock -notify 10 -notifier \
          "notify-send 'Idle Timeout' 'Locking screen in 10 seconds'" &
xfce4-volumed &
~/bin/,root-window &

if -d $HOME/.dropbox-dist/
then $HOME/.dropbox-dist/dropbox-*/dropbox start &
fi

# xfce4-power-manager ?

exec fvwm
