; Personal Blaze - AutoHotkey v2 Text Expander
; Compatible with AutoHotkey v2

; AutoHotkey v2 directives
#Requires AutoHotkey v2.0
#SingleInstance Force
SendMode("Input")
SetWorkingDir(A_ScriptDir)

; Show notification
TrayTip("Text expansion is now active!", "Personal Blaze")

; Text expansions (AutoHotkey v2 syntax)
:*:/hello::Hello! How are you today?
:*:/sig::Best regards,{Enter}Your Name{Enter}Your Title
:*:/date::
{
    Send(FormatTime(, "yyyy/MM/dd HH:mm:ss"))
}

:*:/thanks::Thank you for your time!
:*:/bye::Have a great day!
:*:/yes::Yes, that sounds perfect.
:*:/no::No, that will not work for me.
:*:/addr::123 Main Street{Enter}Tokyo, Japan 100-0001
:*:/email::your.email@example.com
:*:/phone::+81-3-1234-5678
:*:/meet::Let us schedule a meeting.

; Exit hotkey (Ctrl+Alt+Q)
^!q::ExitApp()

; Show startup message in console (if run from command line)
OutputDebug("Personal Blaze v2 started successfully!")