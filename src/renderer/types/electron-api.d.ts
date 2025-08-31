declare global {
  interface Window {
    electronAPI: {
      markAsRead: (notificationId: string) => Promise<void>;
      openInBrowser: (url: string) => Promise<void>;
      muteThread: (threadId: string) => Promise<void>;
      unmuteThread: (threadId: string) => Promise<void>;
      markThreadAsRead: (threadId: string) => Promise<void>;
      markAllAsRead: () => Promise<void>;
      refreshNotifications: () => Promise<void>;
      openSettings: () => Promise<void>;
      onNotificationUpdate: (callback: (notifications: any[]) => void) => void;
      onFocusModeChange: (callback: (mode: string) => void) => void;
      // PAT management
      savePAT: (pat: string) => Promise<boolean>;
      getPAT: () => Promise<string | null>;
      deletePAT: () => Promise<boolean>;
      hasPAT: () => Promise<boolean>;
      // Test method
      test: () => Promise<string>;
    };
  }
}
