; Personal Blaze - AutoHotkey v2 Text Expander
; Compatible with AutoHotkey v2

; AutoHotkey v2 directives
#Requires AutoHotkey v2.0
#SingleInstance Force
SendMode("Input")
SetWorkingDir(A_ScriptDir)

; Set hotstring options for better compatibility
#Hotstring EndChars -()[]{}:;'"/\,.?!`n `t
#Hotstring * O

; Show notification
TrayTip("Text expansion is now active!", "Personal Blaze")

; Text expansions with backspace handling for clean replacement
:*:/hello::{
    Send("{Backspace 6}")
    Sleep(50)
    SendText("Hello! How are you today?")
}

:*:/sig::{
    Send("{Backspace 4}")
    Sleep(50)
    SendText("Best regards,")
    Send("{Enter}")
    SendText("Your Name")
    Send("{Enter}")  
    SendText("Your Title")
}

:*:/date::{
    Send("{Backspace 5}")
    Sleep(50)
    SendText(FormatTime(, "yyyy/MM/dd HH:mm:ss"))
}

:*:/thanks::{
    Send("{Backspace 8}")
    Sleep(50)
    SendText("Thank you for your time!")
}

:*:/bye::{
    Send("{Backspace 4}")
    Sleep(50)
    SendText("Have a great day!")
}

:*:/yes::{
    Send("{Backspace 4}")
    Sleep(50)
    SendText("Yes, that sounds perfect.")
}

:*:/no::{
    Send("{Backspace 3}")
    Sleep(50)
    SendText("No, that will not work for me.")
}

:*:/addr::{
    Send("{Backspace 5}")
    Sleep(50)
    SendText("123 Main Street")
    Send("{Enter}")
    SendText("Tokyo, Japan 100-0001")
}

:*:/email::{
    Send("{Backspace 6}")
    Sleep(50)
    SendText("your.email@example.com")
}

:*:/phone::{
    Send("{Backspace 6}")
    Sleep(50)
    SendText("+81-3-1234-5678")
}

:*:/meet::{
    Send("{Backspace 5}")
    Sleep(50)
    SendText("Let us schedule a meeting.")
}

; Exit hotkey (Ctrl+Alt+Q)
^!q::ExitApp()

; Reload hotkey (Ctrl+Alt+R)
^!r::Reload()

; Show startup message in console (if run from command line)
OutputDebug("Personal Blaze v2 started successfully!")