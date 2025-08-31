import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notification actions
  markAsRead: (notificationId: string) => ipcRenderer.invoke('mark-as-read', notificationId),
  openInBrowser: (url: string) => ipcRenderer.invoke('open-in-browser', url),
  muteThread: (threadId: string) => ipcRenderer.invoke('mute-thread', threadId),
  starThread: (threadId: string) => ipcRenderer.invoke('star-thread', threadId),
  
  // App actions
  refreshNotifications: () => ipcRenderer.invoke('refresh-notifications'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Focus mode integration
  getFocusMode: () => ipcRenderer.invoke('get-focus-mode'),
  
  // Listeners
  onNotificationUpdate: (callback: (count: number) => void) => {
    ipcRenderer.on('notification-update', (_, count) => callback(count));
  },
  
  onFocusModeChange: (callback: (mode: string) => void) => {
    ipcRenderer.on('focus-mode-change', (_, mode) => callback(mode));
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      markAsRead: (notificationId: string) => Promise<void>;
      openInBrowser: (url: string) => Promise<void>;
      muteThread: (threadId: string) => Promise<void>;
      starThread: (threadId: string) => Promise<void>;
      refreshNotifications: () => Promise<void>;
      openSettings: () => Promise<void>;
      quitApp: () => Promise<void>;
      getFocusMode: () => Promise<string>;
      onNotificationUpdate: (callback: (count: number) => void) => void;
      onFocusModeChange: (callback: (mode: string) => void) => void;
    };
  }
}
