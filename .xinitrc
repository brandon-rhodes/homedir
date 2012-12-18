#
# X Windows startup procedure under Arch Linux
#

# First, make sure that all processes and their descendants carry our
# standard environment settings.

source .bashrc

# Configure hardware.

xset r rate 240 40

if [ "$(hostname)" == "guinness" ]
then
    xrandr --dpi 96

    # Turn off touchpad taps, since they are always accidental.

    xinput --set-prop "AlpsPS/2 ALPS DualPoint TouchPad" \
	"Synaptics Tap Action" 0 0 0 0 0 0 0
fi

# Configure X Windows.

xmodmap .Xmodmap
xrdb .Xresources

# Start D-Bus and GNOME Keyring.

source /etc/X11/xinit/xinitrc.d/30-dbus
eval $(/usr/bin/gnome-keyring-daemon --start --components=gpg,pkcs11,secrets,ssh)
export SSH_AUTH_SOCK
export GPG_AGENT_INFO
export GNOME_KEYRING_CONTROL
export GNOME_KEYRING_PID

# Start services and applets.

trayer --edge top --align right --width 6 &
# nm-applet &
blueman-applet &
xscreensaver -no-splash &

exec fvwm
