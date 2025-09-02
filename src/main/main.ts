import { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain, Notification } from 'electron';
import * as path from 'path';
import { SecureStorage } from './secureStorage';

// Add isQuiting property to app object
(app as any).isQuiting = false;

let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;

function createTray() {
  // Create tray icon (you can replace this with your own icon)
  let icon: Electron.NativeImage;
  
  try {
    if (process.platform === 'win32') {
      // Windows: use .ico file if available, otherwise fallback to .png
      const iconPath = path.join(__dirname, '../renderer/assets/icon.ico');
      if (require('fs').existsSync(iconPath)) {
        icon = nativeImage.createFromPath(iconPath);
      } else {
        icon = nativeImage.createFromPath(path.join(__dirname, '../renderer/assets/icon.png'));
      }
    } else {
      // macOS: use .png with template image
      icon = nativeImage.createFromPath(path.join(__dirname, '../renderer/assets/icon.png'));
      icon.setTemplateImage(true);
    }
  } catch (error) {
    // Fallback to a default icon if the file doesn't exist
    console.log('Icon file not found, using default icon');
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzAwN2FmZiIvPgo8cGF0aCBkPSJNOCA0TDEyIDhMOCAxMkw0IDhMOCA0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
  }
  
  tray = new Tray(icon);
  tray.setToolTip('OctoBar - GitHub Notifications');
  
  // Set badge count (this will show on macOS)
  if (process.platform === 'darwin') {
    tray.setTitle('4'); // This shows the badge count on macOS
  }
  
  // Left click shows the popup
  tray.on('click', () => {
    togglePopup();
  });
  
  // Right click shows context menu (Windows behavior)
  if (process.platform === 'win32') {
    tray.on('right-click', () => {
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Show Notifications', click: () => togglePopup() },
        { type: 'separator' },
        { label: 'Settings', click: () => openSettings() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
      ]);
      tray?.popUpContextMenu(contextMenu);
    });
  }
  
  // Remove the automatic context menu display
  // Users can access context menu through other means if needed
  
  // For now, remove the context menu to avoid the double-display issue
  // We can add it back later with a better implementation
}

function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const preloadPath = path.resolve(__dirname, 'preload.js');
  console.log('=== MAIN PROCESS DEBUG ===');
  console.log('Preload script path:', preloadPath);
  console.log('__dirname:', __dirname);
  console.log('Current working directory:', process.cwd());
  
  // Check if preload file exists
  const fs = require('fs');
  if (!fs.existsSync(preloadPath)) {
    console.error('❌ Preload script not found at:', preloadPath);
    console.error('Available files in __dirname:');
    try {
      const files = fs.readdirSync(__dirname);
      console.error('Files:', files);
    } catch (err) {
      console.error('Error reading directory:', err);
    }
    return;
  } else {
    console.log('✅ Preload script found at:', preloadPath);
  }
  
  // Calculate window position based on platform
  let windowX: number;
  let windowY: number;
  
  if (process.platform === 'win32') {
    // Windows: position relative to tray icon (usually bottom-right)
    windowX = width - 470;
    windowY = height - 700; // Position above taskbar
  } else {
    // macOS: position relative to top-right
    windowX = width - 470;
    windowY = 50;
  }
  
  popupWindow = new BrowserWindow({
    width: 450,
    height: 650,
    x: windowX,
    y: windowY,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true // Enable dev tools for debugging
    }
  });
  
  // Add comprehensive error handling
  popupWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', errorCode, errorDescription, validatedURL);
  });
  
  popupWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('❌ Preload script error:', preloadPath, error);
  });

  popupWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading');
  });

  popupWindow.webContents.on('dom-ready', () => {
    console.log('✅ DOM is ready');
  });

  popupWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`🔍 Renderer console [${level}]:`, message);
  });
  
  // Load the React app
  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('🔄 Loading from Vite dev server: http://localhost:3001');
    popupWindow.loadURL('http://localhost:3001');
  } else {
    // In packaged app, the renderer files are in the renderer subdirectory
    const indexPath = path.join(__dirname, 'renderer', 'index.html');
    console.log('🔄 Loading from packaged app:', indexPath);
    console.log('🔄 __dirname:', __dirname);
    console.log('🔄 app.isPackaged:', app.isPackaged);
    
    // Check if the file exists
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      console.log('✅ HTML file exists at:', indexPath);
      popupWindow.loadFile(indexPath);
    } else {
      console.error('❌ HTML file not found at:', indexPath);
      console.error('Available files in __dirname:');
      try {
        const files = fs.readdirSync(__dirname);
        console.error('Files:', files);
        if (fs.existsSync(path.join(__dirname, 'renderer'))) {
          const rendererFiles = fs.readdirSync(path.join(__dirname, 'renderer'));
          console.error('Renderer files:', rendererFiles);
        }
      } catch (err) {
        console.error('Error reading directory:', err);
      }
    }
  }
  
  // Add keyboard shortcut to open dev tools (Cmd+Option+I on macOS, Ctrl+Shift+I on Windows)
  popupWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.meta || input.control) && input.shift && input.key.toLowerCase() === 'i') {
      popupWindow?.webContents.openDevTools();
    }
  });

  // Also add F12 as an alternative shortcut
  popupWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      popupWindow?.webContents.openDevTools();
    }
  });

  // Hide window when it loses focus
  popupWindow.on('blur', () => {
    popupWindow?.hide();
  });
  
  // Prevent window from being closed
  popupWindow.on('close', (event) => {
    if (!(app as any).isQuiting) {
      event.preventDefault();
      popupWindow?.hide();
    }
  });
}

function togglePopup() {
  if (!popupWindow) {
    createPopupWindow();
  }
  
  if (popupWindow?.isVisible()) {
    popupWindow.hide();
  } else {
    popupWindow?.show();
    popupWindow?.focus();
  }
}

function refreshNotifications() {
  // TODO: Implement notification refresh
  console.log('Refreshing notifications...');
}

function openSettings() {
  // TODO: Implement settings window
  console.log('Opening settings...');
}

function showNotification(title: string, body: string, options: any = {}) {
  console.log('🔔 Showing Electron notification:', { title, body, options });
  
  // Check if notifications are supported
  if (!Notification.isSupported()) {
    console.warn('🔔 Electron notifications are not supported on this system');
    return;
  }

  try {
    const notification = new Notification({
      title,
      body,
      icon: options.icon || path.join(__dirname, 'renderer/assets/icon.png'),
      silent: false,
      ...options
    });

    notification.on('click', () => {
      console.log('🔔 Notification clicked');
      // Show the popup window when notification is clicked
      if (popupWindow) {
        popupWindow.show();
        popupWindow.focus();
      }
    });

    notification.on('show', () => {
      console.log('🔔 Notification shown');
    });

    notification.on('close', () => {
      console.log('🔔 Notification closed');
    });

    notification.show();
    return notification;
  } catch (error) {
    console.error('🔔 Failed to show Electron notification:', error);
  }
}

// IPC handlers for PAT management
ipcMain.handle('save-pat', async (_, pat: string) => {
  return await SecureStorage.savePAT(pat);
});

ipcMain.handle('get-pat', async () => {
  return await SecureStorage.getPAT();
});

ipcMain.handle('delete-pat', async () => {
  return await SecureStorage.deletePAT();
});

ipcMain.handle('has-pat', async () => {
  return await SecureStorage.hasPAT();
});

// IPC handler for opening URLs in default browser
ipcMain.handle('open-in-browser', async (_, url: string) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});

// IPC handlers for filter settings management
ipcMain.handle('save-filter-settings', async (_, selectedOrgs: string[], selectedRepos: string[]) => {
  return await SecureStorage.saveFilterSettings(selectedOrgs, selectedRepos);
});

ipcMain.handle('get-filter-settings', async () => {
  return await SecureStorage.getFilterSettings();
});

ipcMain.handle('has-filter-settings', async () => {
  return await SecureStorage.hasFilterSettings();
});

ipcMain.handle('delete-filter-settings', async () => {
  return await SecureStorage.deleteFilterSettings();
});

// IPC handlers for general settings management
ipcMain.handle('set-settings', async (_, settings: any) => {
  return await SecureStorage.saveSettings(settings);
});

ipcMain.handle('get-settings', async () => {
  return await SecureStorage.getSettings();
});

// IPC handler for notifications
ipcMain.handle('show-notification', async (_, title: string, body: string, options: any = {}) => {
  return showNotification(title, body, options);
});

// IPC handler for app control
ipcMain.handle('quit', async () => {
  app.quit();
});

// App lifecycle events
app.whenReady().then(() => {
  // Set the app name to ensure notifications show the correct name
  app.setName('OctoBar');
  
  // Set AppUserModelID for Windows to fix notification app name
  if (process.platform === 'win32') {
    app.setAppUserModelId('OctoBar');
  }
  
  createTray();
  
  // Prevent app from showing in dock on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

app.on('window-all-closed', () => {
  // Keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  (app as any).isQuiting = true;
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (popupWindow) {
      if (popupWindow.isMinimized()) popupWindow.restore();
      popupWindow.focus();
    }
  });
}
