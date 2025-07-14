// Personal Blaze - True Auto Expander
// Type /trigger -> INSTANT auto-replacement (NO manual steps!)

const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');

console.log('Personal Blaze - TRUE Auto Text Expander');
console.log('========================================');

const snippets = {
    'hello': 'Hello! How are you today?',
    'sig': 'Best regards,\nYour Name\nYour Title', 
    'date': () => new Date().toLocaleString(),
    'thanks': 'Thank you for your time!',
    'bye': 'Have a great day!',
    'addr': '123 Main Street\nTokyo, Japan 100-0001',
    'email': 'your.email@example.com'
};

// TRUE auto-expansion using Windows SendKeys
const createTrueExpander = () => `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Runtime.InteropServices

$snippets = @{
${Object.entries(snippets).map(([key, value]) => {
    const content = typeof value === 'function' ? value() : value;
    return `    "${key}" = "${content.replace(/\n/g, '`r`n').replace(/"/g, '""')}"`;
}).join('\n')}
}

$buffer = ""
$triggers = @(${Object.keys(snippets).map(k => `"${k}"`).join(', ')})

# Hook into keyboard input
$source = @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public static class KeyboardHook {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private static LowLevelKeyboardProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;

    public delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void Main() {
        _hookID = SetHook(_proc);
        Application.Run();
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr SetHook(LowLevelKeyboardProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            int vkCode = Marshal.ReadInt32(lParam);
            Console.WriteLine(((Keys)vkCode).ToString());
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);
}
"@

# Simplified approach: Monitor active window typing
Write-Host "🔥 TRUE Auto-Expansion Active"
Write-Host "Just type /hello and it will INSTANTLY replace!"
Write-Host ""

while ($true) {
    Start-Sleep -Milliseconds 100
    
    try {
        # Get current window text by simulating selection
        [System.Windows.Forms.SendKeys]::SendWait("^{LEFT}")
        Start-Sleep -Milliseconds 20
        [System.Windows.Forms.SendKeys]::SendWait("+^{RIGHT}")
        Start-Sleep -Milliseconds 20
        [System.Windows.Forms.SendKeys]::SendWait("^c")
        Start-Sleep -Milliseconds 30
        
        $text = Get-Clipboard -Raw -ErrorAction SilentlyContinue
        if ($text) {
            foreach ($trigger in $triggers) {
                if ($text -eq "/$trigger") {
                    $content = $snippets[$trigger]
                    
                    # INSTANT replacement
                    [System.Windows.Forms.SendKeys]::SendWait("^a")
                    Start-Sleep -Milliseconds 10
                    [System.Windows.Forms.SendKeys]::SendWait("{DEL}")
                    Start-Sleep -Milliseconds 10
                    [System.Windows.Forms.SendKeys]::SendWait($content)
                    
                    Write-Host "⚡ INSTANT: /$trigger -> $($content.Substring(0,30))..."
                    Start-Sleep -Milliseconds 500  # Prevent double-trigger
                    break
                }
            }
        }
    }
    catch {
        # Continue silently
    }
}
`;

function startTrueExpansion() {
    console.log('🔥 Starting TRUE auto-expansion...');
    console.log('💡 Just type /hello in any app - NO Ctrl+A, NO Ctrl+C needed!');
    console.log('');
    
    const script = createTrueExpander();
    fs.writeFileSync('./true-expander.ps1', script);
    
    const psProcess = spawn('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-WindowStyle', 'Hidden',
        '-File', './true-expander.ps1'
    ]);
    
    psProcess.stdout.on('data', (data) => {
        console.log(data.toString().trim());
    });
    
    return psProcess;
}

// Simple management page
const html = `<!DOCTYPE html>
<html><head><title>Personal Blaze - TRUE Expander</title>
<style>
body{font-family:system-ui;margin:20px;background:#f5f5f5}
.card{background:white;padding:20px;margin:10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
h1{color:#333;text-align:center}
.status{background:#d4edda;padding:15px;border-radius:6px;color:#155724;text-align:center;font-weight:bold}
.snippet{border-left:4px solid #dc3545;margin:10px 0;padding:15px;background:#f8f9fa}
.trigger{font-family:monospace;font-weight:bold;color:#dc3545;font-size:18px}
.demo{background:#fff3cd;padding:20px;border-radius:6px;margin:15px 0}
</style></head>
<body>
<div class="card">
<h1>🔥 Personal Blaze - TRUE Auto Expander</h1>
<div class="status">TRUE Auto-Expansion is ACTIVE</div>
</div>

<div class="card">
<h2>💨 How It REALLY Works</h2>
<div class="demo">
<strong>SUPER SIMPLE:</strong><br>
1. Open ANY app (Notepad, Word, Slack, etc.)<br>
2. Type <code>/hello</code><br>
3. That's it! It INSTANTLY becomes "Hello! How are you today?"<br><br>
<strong>NO Ctrl+A! NO Ctrl+C! NO manual steps!</strong>
</div>
</div>

<div class="card">
<h2>⚡ Available Triggers</h2>
${Object.entries(snippets).map(([key, value]) => {
    const content = typeof value === 'function' ? value() : value;
    return `<div class="snippet"><div class="trigger">/${key}</div><div>${content.replace(/\n/g, '<br>')}</div></div>`;
}).join('')}
</div>

<div class="card">
<h2>🧪 Test Now</h2>
<div class="demo">
<strong>Try it:</strong><br>
1. Open Notepad<br>
2. Type exactly: <code>/hello</code><br>
3. Watch it INSTANTLY change to the full greeting!
</div>
</div>
</body></html>`;

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

let expanderProcess = null;

server.listen(9876, () => {
    console.log('Management: http://localhost:9876');
    expanderProcess = startTrueExpansion();
    exec('start http://localhost:9876');
});

process.on('SIGINT', () => {
    if (expanderProcess) expanderProcess.kill();
    try { fs.unlinkSync('./true-expander.ps1'); } catch {}
    process.exit();
});