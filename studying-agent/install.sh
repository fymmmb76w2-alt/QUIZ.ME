#!/bin/bash
# usage: ./install.sh +420XXXXXXXXX [/path/to/watch/folder]
set -eu
[ "$(uname)" = Darwin ] || { echo "macOS required"; exit 1; }
PHONE="${1:-}"; WATCH_DIR="${2:-}"
[ -n "$PHONE" ] || read -r -p "iMessage recipient (e.g. +420123456789): " PHONE
[ -n "$WATCH_DIR" ] || read -r -p "Folder to watch (full path): " WATCH_DIR
PHONE="${PHONE//[[:space:]]/}"
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$HOME/.studying-agent"
CLAUDE_BIN="$(command -v claude || true)"
[ -x "$CLAUDE_BIN" ] || { echo "claude CLI not found in PATH (install Claude Code and log in)"; exit 1; }

echo "Checking Claude CLI..."
"$CLAUDE_BIN" -p "Reply with the single word: ok" >/dev/null 2>&1 || { echo "claude CLI is installed but not logged in. Run 'claude' once and log in."; exit 1; }
mkdir -p "$APP" "$WATCH_DIR"
cp "$HERE/process.sh" "$HERE/send_imessage.applescript" "$APP/"
chmod +x "$APP/process.sh"
cat > "$APP/config.env" <<CONF
WATCH_DIR="$WATCH_DIR"
PHONE="$PHONE"
CLAUDE_BIN="$CLAUDE_BIN"
SEND_SCRIPT="$APP/send_imessage.applescript"
CONF
chmod 600 "$APP/config.env"

PLIST="$HOME/Library/LaunchAgents/com.studying-agent.plist"
cat > "$PLIST" <<P
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
 <key>Label</key><string>com.studying-agent</string>
 <key>ProgramArguments</key><array><string>/bin/bash</string><string>$APP/process.sh</string></array>
 <key>WatchPaths</key><array><string>$WATCH_DIR</string></array>
 <key>RunAtLoad</key><true/>
 <key>StartInterval</key><integer>60</integer>
 <key>ThrottleInterval</key><integer>10</integer>
 <key>EnvironmentVariables</key><dict><key>PATH</key><string>$(dirname "$CLAUDE_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
 <key>StandardOutPath</key><string>$APP/launchd.out</string>
 <key>StandardErrorPath</key><string>$APP/launchd.err</string>
</dict></plist>
P
launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Installed. Sending test message (approve the Automation prompt for Messages)..."
osascript "$APP/send_imessage.applescript" "Study agent installed. Watching $WATCH_DIR" "$PHONE"
echo "Log: $APP/agent.log"
