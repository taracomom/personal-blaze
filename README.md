# Personal Blaze - Text Expansion Manager

A free, TextBlaze-like text expansion tool with cloud-based snippet management for Windows.

## 🚀 Features

- **Real-time Text Expansion**: Type `/hello` anywhere and it expands instantly
- **Web Management**: Manage snippets from https://taracomom.github.io/personal-blaze/
- **Auto-startup**: Starts automatically when Windows boots
- **No Admin Rights**: Works with regular user permissions
- **One-click Updates**: Add/delete snippets with automatic AutoHotkey restart
- **Background Operation**: Runs invisibly in the background

## 📦 Installation

1. **Download** the repository
2. **Run** `install-startup.bat` to set up auto-startup
3. **Access** the web manager at https://taracomom.github.io/personal-blaze/
4. **Start using** text expansion immediately

## 💡 Usage

1. **Add Snippets**: Use the web interface to add new text expansions
2. **Type Triggers**: In any application, type `/hello` and it expands to "Hello! How are you today?"
3. **Auto-sync**: Changes are automatically applied to AutoHotkey

## 🛠️ File Structure

```
personal-blaze/
├── web-manager.html          # Web management interface
├── personal-blaze.ahk        # AutoHotkey script for text expansion
├── personal-blaze-service.js # Local helper service for updates
├── simple-background.bat     # Background service launcher
├── install-startup.bat       # Auto-startup installer
├── start.bat                 # Manual startup launcher
└── CLAUDE.md                 # Complete requirements documentation
```

## 🔧 Requirements

- **Windows** with AutoHotkey v2.0+
- **Node.js** (for helper service)
- **Modern web browser** (for snippet management)

## 📱 Default Snippets

- `/hello` → Hello! How are you today?
- `/sig` → Best regards, Your Name, Your Title
- `/date` → Current date and time
- `/thanks` → Thank you for your time!
- `/bye` → Have a great day!

## 🎯 Why Personal Blaze?

- **Free Alternative**: All features of premium text expansion tools
- **Cloud Management**: Edit snippets from anywhere with web access
- **Instant Updates**: No manual file editing or script reloading
- **Simple Setup**: One-time installation, then forget about it

## 📄 License

MIT License - Free for personal and commercial use
