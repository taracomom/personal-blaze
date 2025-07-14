const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let ahkProcess = null;

// Start AutoHotkey process
function startAutoHotkey() {
    if (ahkProcess) {
        ahkProcess.kill();
    }
    
    const ahkPath = path.join(__dirname, 'personal-blaze.ahk');
    ahkProcess = spawn('"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"', [ahkPath], {
        shell: true,
        detached: true,
        stdio: 'ignore'
    });
    
    ahkProcess.unref();
    console.log('AutoHotkey restarted');
}

// Get current snippets from AHK file
function getCurrentSnippets() {
    try {
        const content = fs.readFileSync(path.join(__dirname, 'personal-blaze.ahk'), 'utf8');
        const snippets = {};
        
        // Parse existing AHK file for snippets
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith(':*:/') && line.includes('::')) {
                const parts = line.split('::');
                if (parts.length >= 2) {
                    const trigger = parts[0].replace(':*:/', '');
                    let content = parts.slice(1).join('::');
                    
                    // Handle multiline date function
                    if (content === '' && i + 1 < lines.length && lines[i + 1].trim() === '{') {
                        content = 'DATETIME';
                        i += 3; // Skip the multiline function
                    }
                    
                    snippets[trigger] = content.replace(/\{Enter\}/g, '\\n');
                }
            }
        }
        
        return snippets;
    } catch (error) {
        console.error('Error reading AHK file:', error);
        return {};
    }
}

// Generate AHK script
function generateAHKScript(snippets) {
    let script = `; Personal Blaze - AutoHotkey v2 Text Expander
; Compatible with AutoHotkey v2

; AutoHotkey v2 directives
#Requires AutoHotkey v2.0
#SingleInstance Force
SendMode("Input")
SetWorkingDir(A_ScriptDir)

; Show notification
TrayTip("Text expansion is now active!", "Personal Blaze")

; Text expansions (AutoHotkey v2 syntax)
`;

    for (const [trigger, content] of Object.entries(snippets)) {
        if (content === 'DATETIME') {
            script += `:*:/${trigger}::\n{\n    Send(FormatTime(, "yyyy/MM/dd HH:mm:ss"))\n}\n\n`;
        } else {
            const ahkContent = content.replace(/\\n/g, '{Enter}').replace(/\\/g, '\\\\');
            script += `:*:/${trigger}::${ahkContent}\n`;
        }
    }

    script += `
; Exit hotkey (Ctrl+Alt+Q)
^!q::ExitApp()

; Show startup message in console (if run from command line)
OutputDebug("Personal Blaze v2 started successfully!")
`;

    return script;
}

// API endpoints
app.get('/api/snippets', (req, res) => {
    const snippets = getCurrentSnippets();
    res.json(snippets);
});

app.post('/api/snippets', (req, res) => {
    try {
        const snippets = req.body;
        const ahkScript = generateAHKScript(snippets);
        
        // Kill existing AutoHotkey process
        if (ahkProcess) {
            ahkProcess.kill();
        }
        
        // Kill any existing AutoHotkey processes
        exec('taskkill /f /im AutoHotkey.exe 2>nul', () => {
            // Write new AHK file
            fs.writeFileSync(path.join(__dirname, 'personal-blaze.ahk'), ahkScript, 'utf8');
            
            // Restart AutoHotkey after a brief delay
            setTimeout(() => {
                startAutoHotkey();
            }, 1000);
        });
        
        res.json({ success: true, message: 'Snippets updated and AutoHotkey restarted!' });
    } catch (error) {
        console.error('Error updating snippets:', error);
        res.status(500).json({ success: false, message: 'Failed to update snippets' });
    }
});

app.listen(port, () => {
    console.log(`Personal Blaze Server running at http://localhost:${port}`);
    console.log('Open http://localhost:3000 in your browser to manage snippets');
    
    // Start AutoHotkey on server start
    startAutoHotkey();
});

// Graceful shutdown
process.on('SIGINT', () => {
    if (ahkProcess) {
        ahkProcess.kill();
    }
    process.exit(0);
});