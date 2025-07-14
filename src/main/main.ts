import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } from 'electron';
import * as path from 'path';
import * as os from 'os';
import AutoLaunch from 'electron-auto-launch';
import { DatabaseService } from './services/DatabaseService';
import { APIServer } from './services/APIServer';
import { KeyboardHookService } from './services/KeyboardHookService';
import { TrayService } from './services/TrayService';
import { APP_NAME, DEFAULT_SERVER_PORT, DEFAULT_GLOBAL_SHORTCUT } from '@/shared/constants';

class PersonalBlazeApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private databaseService: DatabaseService;
  private apiServer: APIServer;
  private keyboardHookService: KeyboardHookService;
  private trayService: TrayService;
  private autoLauncher: AutoLaunch;

  constructor() {
    this.databaseService = new DatabaseService();
    this.apiServer = new APIServer(this.databaseService);
    this.keyboardHookService = new KeyboardHookService(this.databaseService);
    this.trayService = new TrayService();
    
    this.autoLauncher = new AutoLaunch({
      name: APP_NAME,
      path: process.execPath,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    app.whenReady().then(() => {
      this.initialize();
    });

    app.on('window-all-closed', () => {
      // Keep app running in background for tray functionality
      if (process.platform !== 'darwin') {
        // Don't quit on macOS
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  private async initialize() {
    try {
      // Initialize database
      await this.databaseService.initialize();
      
      // Start API server
      await this.apiServer.start(DEFAULT_SERVER_PORT);
      
      // Setup keyboard hooks
      this.setupGlobalShortcuts();
      await this.keyboardHookService.initialize();
      
      // Create tray
      this.setupTray();
      
      // Setup auto-launch if enabled
      await this.setupAutoLaunch();
      
      console.log(`${APP_NAME} initialized successfully`);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  private setupGlobalShortcuts() {
    // Register global shortcut for opening management window
    globalShortcut.register(DEFAULT_GLOBAL_SHORTCUT, () => {
      this.showMainWindow();
    });
  }

  private setupTray() {
    this.tray = this.trayService.createTray();
    
    if (this.tray) {
      this.tray.on('double-click', () => {
        this.showMainWindow();
      });
      
      this.tray.setContextMenu(this.createTrayMenu());
    }
  }

  private createTrayMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Open Personal Blaze',
        click: () => this.showMainWindow(),
      },
      {
        label: 'Settings',
        click: () => this.showSettings(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      icon: this.getAppIcon(),
      show: false,
    });

    // Load the management interface
    if (app.isPackaged) {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      this.mainWindow.loadURL('http://localhost:3000');
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Hide window instead of closing when user clicks X
    this.mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });
  }

  private showMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    } else {
      this.createMainWindow();
    }
  }

  private showSettings() {
    // TODO: Implement settings window
    this.showMainWindow();
  }

  private getAppIcon(): string {
    const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
    return path.join(__dirname, '../assets', iconName);
  }

  private async setupAutoLaunch() {
    try {
      const isEnabled = await this.autoLauncher.isEnabled();
      const shouldEnable = true; // TODO: Get from settings
      
      if (shouldEnable && !isEnabled) {
        await this.autoLauncher.enable();
      } else if (!shouldEnable && isEnabled) {
        await this.autoLauncher.disable();
      }
    } catch (error) {
      console.error('Failed to setup auto-launch:', error);
    }
  }

  private cleanup() {
    globalShortcut.unregisterAll();
    this.keyboardHookService.cleanup();
    this.apiServer.stop();
    this.databaseService.close();
  }
}

// Initialize the application
new PersonalBlazeApp();