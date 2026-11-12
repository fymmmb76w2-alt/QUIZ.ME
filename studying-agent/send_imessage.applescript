-- usage: osascript send_imessage.applescript "<text>" "<phone>"
on run argv
	set theText to item 1 of argv
	set thePhone to item 2 of argv
	tell application "Messages"
		set svc to 1st account whose service type = iMessage
		set theBuddy to participant thePhone of svc
		send theText to theBuddy
	end tell
end run
