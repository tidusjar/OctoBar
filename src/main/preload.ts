console.log('=== PRELOAD SCRIPT STARTING ===');

try {
  const { contextBridge, ipcRenderer } = require('electron');
  console.log('Electron modules loaded successfully');
  console.log('contextBridge:', typeof contextBridge);
  console.log('ipcRenderer:', typeof ipcRenderer);
  
  // Test if contextBridge is available
  if (!contextBridge) {
    throw new Error('contextBridge is not available');
  }
  
  console.log('About to expose electronAPI...');
  
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld('electronAPI', {
    // Simple test method
    test: () => {
      console.log('Test method called from renderer');
      return 'Hello from preload!';
    },
    
    // PAT management
    savePAT: (pat: string) => {
      console.log('savePAT called with:', pat ? `${pat.substring(0, 10)}...` : 'undefined');
      return ipcRenderer.invoke('save-pat', pat);
    },
    getPAT: () => {
      console.log('getPAT called');
      return ipcRenderer.invoke('get-pat');
    },
    deletePAT: () => {
      console.log('deletePAT called');
      return ipcRenderer.invoke('delete-pat');
    },
    hasPAT: () => {
      console.log('hasPAT called');
      return ipcRenderer.invoke('has-pat');
    },
    
    // Filter settings management
    saveFilterSettings: (selectedOrgs: string[], selectedRepos: string[]) => {
      console.log('saveFilterSettings called with:', selectedOrgs.length, 'orgs and', selectedRepos.length, 'repos');
      return ipcRenderer.invoke('save-filter-settings', selectedOrgs, selectedRepos);
    },
    getFilterSettings: () => {
      console.log('getFilterSettings called');
      return ipcRenderer.invoke('get-filter-settings');
    },
    hasFilterSettings: () => {
      console.log('hasFilterSettings called');
      return ipcRenderer.invoke('has-filter-settings');
    },
    deleteFilterSettings: () => {
      console.log('deleteFilterSettings called');
      return ipcRenderer.invoke('delete-filter-settings');
    },
    
    // App control
    quit: () => {
      console.log('quit called');
      return ipcRenderer.invoke('quit');
    },
    
    // Settings management
    setSettings: (settings: any) => {
      console.log('setSettings called with:', settings);
      return ipcRenderer.invoke('set-settings', settings);
    },
    getSettings: () => {
      console.log('getSettings called');
      return ipcRenderer.invoke('get-settings');
    },
    
    // Open URL in default browser
    openInBrowser: (url: string) => {
      console.log('openInBrowser called with:', url);
      return ipcRenderer.invoke('open-in-browser', url);
    },
    
    // Notifications
    showNotification: (title: string, body: string, options: any = {}) => {
      console.log('showNotification called with:', { title, body, options });
      return ipcRenderer.invoke('show-notification', title, body, options);
    },
  });
  
  console.log('electronAPI exposed successfully');
  console.log('window.electronAPI should now be available in renderer');
  
} catch (error: any) {
  console.error('=== ERROR IN PRELOAD SCRIPT ===');
  console.error('Error details:', error);
  console.error('Error stack:', error.stack);
}

console.log('=== PRELOAD SCRIPT COMPLETED ===');

