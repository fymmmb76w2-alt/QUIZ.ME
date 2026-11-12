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
./install.sh "+420XXXXXXXXX" "/full/path/to/watch/folder" "/full/path/to/install/dir"
```

Arguments are optional; phone and watch folder are prompted if missing, install dir defaults to `~/.studying-agent`. Quote paths; do not backslash-escape them.

## One-time permissions

1. Approve the Automation prompt (allow control of Messages) when the test message is sent.
2. System Settings → Privacy & Security → Full Disk Access → `+` → Cmd+Shift+G → `/bin/bash` → enable.
3. iCloud Drive folders: right-click the folder in Finder → Keep Downloaded.

## Verify

```bash
echo "What is the capital of France?" > "/full/path/to/folder/test.txt"
sleep 90; cat <install dir>/agent.log
```

Expected: `processing test.txt`, `done test.txt`, and one iMessage `1 - Paris`.

## Operate

`<install dir>` is the third install argument (default `~/.studying-agent`).

| Task | Command |
|---|---|
| Log | `cat <install dir>/agent.log` |
| launchd errors | `cat <install dir>/launchd.err` |
| Agent state | `launchctl list \| grep studying-agent` |
| Run now | `bash <install dir>/process.sh` |
| Change model | add `MODEL=<model-id>` to `<install dir>/config.env` (default `claude-opus-5-5`; reinstall resets it) |
| Change delay | add `SEND_DELAY=<seconds>` to `<install dir>/config.env` (default 5; reinstall resets it) |
| Update | `git pull`, then rerun `./install.sh` with the same arguments |
| Change phone/folder | rerun `./install.sh` with new values |
| Remove | `<install dir>/uninstall.sh` |

## Files

- `install.sh`: writes config, copies scripts to `<install dir>/`, registers the launchd agent (`WatchPaths` plus 60-second polling), sends a test message
- `process.sh`: evaluates new files and sends answers
- `send_imessage.applescript`: sends one iMessage
- `uninstall.sh`: removes agent and config

Config lives in `<install dir>/config.env` (permissions 600). The repository contains no phone numbers or paths.
