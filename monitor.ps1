
Add-Type -AssemblyName System.Windows.Forms

# Snippet definitions
$snippets = @{
    "hello" = "Hello! How are you today?"
    "sig" = "Best regards,`r`nYour Name`r`nYour Title"
    "date" = "2025/7/14 12:14:38"
    "addr" = "123 Main Street`r`nTokyo, Japan 100-0001"
    "email" = "your.email@example.com"
    "phone" = "+81-3-1234-5678"
    "thanks" = "Thank you for your time!"
    "meet" = "Let us schedule a meeting."
    "bye" = "Have a great day!"
    "yes" = "Yes, that sounds perfect."
    "no" = "No, that will not work for me."
}

$triggers = @("hello", "sig", "date", "addr", "email", "phone", "thanks", "meet", "bye", "yes", "no")

Write-Host "Text expansion monitoring started"
Write-Host "Available triggers: /hello, /sig, /date, /addr, /email, /phone, /thanks, /meet, /bye, /yes, /no"
Write-Host ""
Write-Host "Usage: Type /trigger in any app, select text (Ctrl+A), copy (Ctrl+C)"
Write-Host ""

$lastClipboard = ""

while ($true) {
    Start-Sleep -Milliseconds 250
    
    try {
        $currentClip = Get-Clipboard -Raw -ErrorAction SilentlyContinue
        
        if ($currentClip -and $currentClip -ne $lastClipboard) {
            $lastClipboard = $currentClip
            
            # Check each trigger
            foreach ($trigger in $triggers) {
                $pattern = "/$trigger" + '$'
                if ($currentClip -match $pattern) {
                    $content = $snippets[$trigger]
                    if ($content) {
                        # Replace trigger with content
                        $newText = $currentClip -replace $pattern, $content
                        Set-Clipboard -Value $newText
                        
                        # Auto-paste
                        Start-Sleep -Milliseconds 100
                        [System.Windows.Forms.SendKeys]::SendWait("^a")
                        Start-Sleep -Milliseconds 50
                        [System.Windows.Forms.SendKeys]::SendWait("^v")
                        
                        $preview = $content.Substring(0, [Math]::Min(40, $content.Length))
                        if ($content.Length -gt 40) { $preview += "..." }
                        Write-Host "Expanded: /$trigger -> $preview"
                        break
                    }
                }
            }
        }
    }
    catch {
        # Ignore clipboard access errors
    }
}
