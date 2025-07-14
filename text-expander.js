// Personal Blaze - Text Expander
// Real-time snippet expansion system

const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Personal Blaze - Text Expander');
console.log('==============================');

// Snippet definitions
const snippets = {
    'hello': 'Hello! How are you today?',
    'sig': 'Best regards,\nYour Name\nYour Title',
    'date': () => new Date().toLocaleString(),
    'addr': '123 Main Street\nTokyo, Japan 100-0001',
    'email': 'your.email@example.com',
    'phone': '+81-3-1234-5678',
    'thanks': 'Thank you for your time!',
    'meet': 'Let us schedule a meeting.',
    'bye': 'Have a great day!',
    'yes': 'Yes, that sounds perfect.',
    'no': 'No, that will not work for me.'
};

// Create PowerShell monitoring script
function createMonitoringScript() {
    return `
Add-Type -AssemblyName System.Windows.Forms

# Snippet definitions
$snippets = @{
${Object.entries(snippets).map(([key, value]) => {
    const content = typeof value === 'function' ? value() : value;
    const escaped = content.replace(/\r?\n/g, '`r`n').replace(/"/g, '""');
    return `    "${key}" = "${escaped}"`;
}).join('\n')}
}

$triggers = @(${Object.keys(snippets).map(k => `"${k}"`).join(', ')})

Write-Host "Text expansion monitoring started"
Write-Host "Available triggers: ${Object.keys(snippets).map(k => `/${k}`).join(', ')}"
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
`;
}

// Start monitoring process
function startTextExpansion() {
    console.log('Starting text expansion monitoring...');
    
    const script = createMonitoringScript();
    const scriptPath = path.join(__dirname, 'monitor.ps1');
    
    try {
        fs.writeFileSync(scriptPath, script, 'utf8');
        
        const psProcess = spawn('powershell', [
            '-WindowStyle', 'Hidden',
            '-ExecutionPolicy', 'Bypass',
            '-File', scriptPath
        ], {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        psProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                console.log(output);
            }
        });
        
        psProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error && !error.includes('Set-Clipboard') && !error.includes('Get-Clipboard')) {
                console.error('Monitor error:', error);
            }
        });
        
        psProcess.on('exit', (code) => {
            console.log('Text expansion monitoring stopped');
            if (code !== 0) {
                console.log('Exit code:', code);
            }
        });
        
        console.log('Text expansion system is now active');
        console.log('');
        
        return psProcess;
    } catch (error) {
        console.error('Failed to start text expansion:', error.message);
        return null;
    }
}

// Management interface
const managementHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Personal Blaze - Text Expander</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; padding: 20px; background: #f5f5f5; 
        }
        .container { max-width: 900px; margin: 0 auto; }
        .card { 
            background: white; padding: 25px; margin: 20px 0; 
            border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }
        .status { 
            padding: 20px; background: linear-gradient(135deg, #d4edda, #c3e6cb); 
            border-radius: 8px; color: #155724; text-align: center; font-weight: bold;
        }
        .snippet { 
            border-left: 5px solid #007acc; margin: 15px 0; padding: 20px; 
            background: #f8f9fa; border-radius: 8px; transition: all 0.2s;
        }
        .snippet:hover { 
            background: #e9ecef; transform: translateY(-2px); 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .trigger { 
            font-family: 'Courier New', monospace; font-weight: bold; 
            color: #007acc; font-size: 20px; margin-bottom: 10px; 
        }
        .content { 
            white-space: pre-wrap; color: #495057; line-height: 1.5; 
            background: white; padding: 15px; border-radius: 6px;
            border: 1px solid #dee2e6;
        }
        .demo { 
            background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
            padding: 25px; border-radius: 8px; margin: 20px 0; 
        }
        h1 { 
            color: #333; text-align: center; margin-bottom: 10px; 
            font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        h2 { 
            color: #555; border-bottom: 3px solid #007acc; 
            padding-bottom: 10px; font-size: 1.5em; 
        }
        .usage { 
            background: linear-gradient(135deg, #e8f4fd, #d1ecf1); 
            padding: 20px; border-radius: 8px; 
        }
        .active-indicator { 
            display: inline-block; width: 12px; height: 12px; 
            background: #28a745; border-radius: 50%; margin-right: 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 
            0% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.5; transform: scale(1.1); } 
            100% { opacity: 1; transform: scale(1); } 
        }
        .step { 
            margin: 10px 0; padding: 15px; background: white; 
            border-radius: 6px; border-left: 4px solid #007acc;
        }
        .grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>🚀 Personal Blaze</h1>
            <h2 style="text-align: center; border: none;">Text Expander</h2>
            <div class="status">
                <span class="active-indicator"></span>
                Real-time Text Expansion is ACTIVE
            </div>
        </div>

        <div class="card">
            <h2>📋 How to Use</h2>
            <div class="usage">
                <div class="step">
                    <strong>Step 1:</strong> Open any application (Notepad, Word, Slack, etc.)
                </div>
                <div class="step">
                    <strong>Step 2:</strong> Type a trigger like <code>/hello</code>
                </div>
                <div class="step">
                    <strong>Step 3:</strong> Select all text with <code>Ctrl+A</code>
                </div>
                <div class="step">
                    <strong>Step 4:</strong> Copy with <code>Ctrl+C</code> - text will automatically expand!
                </div>
            </div>
        </div>

        <div class="card">
            <h2>⚡ Available Snippets</h2>
            <div class="grid">
                ${Object.entries(snippets).map(([key, value]) => {
                    const content = typeof value === 'function' ? value() : value;
                    return `
                        <div class="snippet">
                            <div class="trigger">/${key}</div>
                            <div class="content">${content}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="card">
            <h2>🧪 Quick Test</h2>
            <div class="demo">
                <strong>Try it right now:</strong><br><br>
                1. Open <strong>Notepad</strong> (Windows key + R, type "notepad", press Enter)<br>
                2. Type <code>/hello</code> in Notepad<br>
                3. Press <code>Ctrl+A</code> to select all<br>
                4. Press <code>Ctrl+C</code> to copy<br>
                5. Watch the magic happen! ✨<br><br>
                <strong>Result:</strong> "/hello" becomes "Hello! How are you today?"
            </div>
        </div>
    </div>
</body>
</html>`;

// HTTP Server
const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    
    if (url.pathname === '/') {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(managementHTML);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

// Application startup
let monitorProcess = null;

function startServer(port) {
    server.listen(port, () => {
        console.log(`Management interface: http://localhost:${port}`);
        console.log('');
        
        // Start text expansion monitoring
        monitorProcess = startTextExpansion();
        
        // Open browser
        exec(`start http://localhost:${port}`, (error) => {
            if (error) {
                console.log('Could not open browser automatically');
                console.log(`Please open: http://localhost:${port}`);
            }
        });
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err.message);
        }
    });
}

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\nShutting down Personal Blaze...');
    
    if (monitorProcess) {
        monitorProcess.kill();
    }
    
    server.close();
    
    // Clean up PowerShell script
    const scriptPath = path.join(__dirname, 'monitor.ps1');
    try {
        fs.unlinkSync(scriptPath);
    } catch (e) {
        // Ignore cleanup errors
    }
    
    console.log('Personal Blaze stopped');
    process.exit(0);
});

// Start the application
startServer(9876);