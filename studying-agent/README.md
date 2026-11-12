# studying-agent

Watches a folder on a Mac. For each new file, Claude answers the questions in it and the answers are sent by iMessage, one message per line (`1 - answer`), 5 seconds apart. Processed files move to `.processed/` (failures to `.failed/`) inside the watched folder.

## Requirements (per Mac)

- macOS, signed into iMessage in the Messages app
- Claude Code CLI installed and logged in (`claude` works in Terminal)
- git (and `gh auth login` or a personal access token if the repository is private)

## Install

```bash
git clone https://github.com/fymmmb76w2-alt/quiz.me.git
cd quiz.me
git checkout claude/funny-pasteur-p7faj7
cd studying-agent
./install.sh "+420XXXXXXXXX" "/full/path/to/folder"
```

Arguments are optional; the installer prompts for missing ones. Quote the folder path.

## One-time permissions

1. Approve the Automation prompt (allow control of Messages) when the test message is sent.
2. System Settings → Privacy & Security → Full Disk Access → `+` → Cmd+Shift+G → `/bin/bash` → enable.
3. iCloud Drive folders: right-click the folder in Finder → Keep Downloaded.

## Verify

```bash
echo "What is the capital of France?" > "/full/path/to/folder/test.txt"
sleep 90; cat ~/.studying-agent/agent.log
```

Expected: `processing test.txt`, `done test.txt`, and one iMessage `1 - Paris`.

## Operate

| Task | Command |
|---|---|
| Log | `cat ~/.studying-agent/agent.log` |
| launchd errors | `cat ~/.studying-agent/launchd.err` |
| Agent state | `launchctl print gui/$(id -u)/com.studying-agent \| grep -E "state\|runs\|last exit"` |
| Run now | `bash ~/.studying-agent/process.sh` |
| Change delay | add `SEND_DELAY=<seconds>` to `~/.studying-agent/config.env` (default 5; reinstall resets it) |
| Update | `git pull`, then rerun `./install.sh` |
| Change phone/folder | rerun `./install.sh` with new values |
| Remove | `./uninstall.sh` |

## Files

- `install.sh`: writes config, copies scripts to `~/.studying-agent/`, registers the launchd agent (`WatchPaths` plus 60-second polling), sends a test message
- `process.sh`: evaluates new files and sends answers
- `send_imessage.applescript`: sends one iMessage
- `uninstall.sh`: removes agent and config

Config lives in `~/.studying-agent/config.env` (permissions 600). The repository contains no phone numbers or paths.
