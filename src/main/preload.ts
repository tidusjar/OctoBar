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
    
    // Open URL in default browser
    openInBrowser: (url: string) => {
      console.log('openInBrowser called with:', url);
      return ipcRenderer.invoke('open-in-browser', url);
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

