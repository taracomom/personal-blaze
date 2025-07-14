// Personal Blaze Helper - Auto-update service
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 8765;

app.use(cors());
app.use(express.json());
app.use(express.text());

const STARTUP_PATH = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'personal-blaze.ahk');

// Update AutoHotkey script and restart
app.post('/update-script', (req, res) => {
    try {
        const ahkScript = req.body;
        
        // Kill existing AutoHotkey processes
        exec('taskkill /f /im AutoHotkey.exe 2>nul', (err) => {
            // Write new script to startup folder
            fs.writeFileSync(STARTUP_PATH, ahkScript, 'utf8');
            
            // Start AutoHotkey
            setTimeout(() => {
                exec(`"${STARTUP_PATH}"`, (err) => {
                    if (err) console.error('Error starting AutoHotkey:', err);
                });
            }, 1000);
            
            res.json({ success: true, message: 'Script updated and restarted!' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'running', version: '1.0' });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Personal Blaze Helper running on http://localhost:${PORT}`);
    console.log('This service enables one-click AutoHotkey updates from the web manager');
});

// Start AutoHotkey on helper start
if (fs.existsSync(STARTUP_PATH)) {
    exec(`"${STARTUP_PATH}"`);
}