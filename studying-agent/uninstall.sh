#!/bin/bash
PLIST="$HOME/Library/LaunchAgents/com.studying-agent.plist"
launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null
rm -f "$PLIST"; rm -rf "$HOME/.studying-agent"
echo removed
