#!/bin/bash
# usage: <install dir>/uninstall.sh   (or ./uninstall.sh for the default ~/.studying-agent)
APP="$(cd "$(dirname "$0")" && pwd)"
[ -f "$APP/config.env" ] || APP="$HOME/.studying-agent"
# shellcheck disable=SC1090
LABEL=$(sed -n 's/^LABEL="\(.*\)"/\1/p' "$APP/config.env" 2>/dev/null)
[ -n "$LABEL" ] || LABEL=com.studying-agent
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
rm -f "$PLIST"
rm -rf "$APP/config.env" "$APP/process.sh" "$APP/send_imessage.applescript" "$APP/lock" "$APP/stage"
echo "removed $LABEL (logs kept in $APP)"
