import { Tray, nativeImage } from 'electron';
import * as path from 'path';

export class TrayService {
  createTray(): Tray | null {
    try {
      const iconPath = this.getTrayIconPath();
      const trayIcon = nativeImage.createFromPath(iconPath);
      
      if (trayIcon.isEmpty()) {
        console.warn('Tray icon not found, creating empty tray');
        return new Tray(nativeImage.createEmpty());
      }
      
      const tray = new Tray(trayIcon);
      tray.setToolTip('Personal Blaze - Text Expander');
      
      return tray;
    } catch (error) {
      console.error('Failed to create tray:', error);
      return null;
    }
  }

  private getTrayIconPath(): string {
    const platform = process.platform;
    let iconName: string;

    switch (platform) {
      case 'win32':
        iconName = 'tray-icon.ico';
        break;
      case 'darwin':
        iconName = 'tray-iconTemplate.png'; // macOS convention for template icons
        break;
      default:
        iconName = 'tray-icon.png';
    }

    return path.join(__dirname, '../../assets/tray', iconName);
  }
}