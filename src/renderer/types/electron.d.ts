declare global {
  interface Window {
    electronAPI: {
      markAsRead: (notificationId: string) => Promise<void>;
      openInBrowser: (url: string) => Promise<void>;
      muteThread: (threadId: string) => Promise<void>;
      unmuteThread: (threadId: string) => Promise<void>;
      markThreadAsRead: (threadId: string) => Promise<void>;
      markAllAsRead: () => Promise<void>;
      starThread: (threadId: string) => Promise<void>;
      refreshNotifications: () => Promise<void>;
      openSettings: () => Promise<void>;
      quitApp: () => Promise<void>;
      getFocusMode: () => Promise<string>;
      // PAT management
      savePAT: (pat: string) => Promise<boolean>;
      setPAT: (pat: string) => Promise<boolean>;
      getPAT: () => Promise<string | null>;
      deletePAT: () => Promise<boolean>;
      hasPAT: () => Promise<boolean>;
      // Filter settings management
      saveFilterSettings: (selectedOrgs: string[], selectedRepos: string[]) => Promise<boolean>;
      getFilterSettings: () => Promise<{ organizations: string[], repositories: string[] } | null>;
      hasFilterSettings: () => Promise<boolean>;
      deleteFilterSettings: () => Promise<boolean>;
      // Settings management
      setSettings: (settings: any) => Promise<boolean>;
      getSettings: () => Promise<any>;
      // App control
      quit: () => Promise<void>;
      onNotificationUpdate: (callback: (count: number) => void) => void;
      onFocusModeChange: (callback: (mode: string) => void) => void;
      // Test method
      test: () => Promise<string>;
    };
  }
}

export {};
