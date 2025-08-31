import { app, BrowserWindow, Tray, Menu, nativeImage, screen } from 'electron';
import * as path from 'path';

// Add isQuiting property to app object
(app as any).isQuiting = false;

let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;

function createTray() {
  // Create tray icon (you can replace this with your own icon)
  let icon: Electron.NativeImage;
  
  try {
    icon = nativeImage.createFromPath(path.join(__dirname, '../renderer/assets/icon.png'));
    icon.setTemplateImage(true);
  } catch (error) {
    // Fallback to a default icon if the file doesn't exist
    console.log('Icon file not found, using default icon');
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzAwN2FmZiIvPgo8cGF0aCBkPSJNOCA0TDEyIDhMOCAxMkw0IDhMOCA0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+');
  }
  
  tray = new Tray(icon);
  tray.setToolTip('OctoBar - GitHub Notifications');
  
  // Set badge count (this will show on macOS)
  tray.setTitle('0'); // This shows the badge count on macOS
  
  // Left click shows the popup
  tray.on('click', () => {
    togglePopup();
  });
  
  // Remove the automatic context menu display
  // Users can access context menu through other means if needed
  
  // For now, remove the context menu to avoid the double-display issue
  // We can add it back later with a better implementation
}

function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  popupWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: 50,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  // Load the React app
  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    popupWindow.loadURL('http://localhost:3001');
  } else {
    popupWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
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

// App lifecycle events
app.whenReady().then(() => {
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
