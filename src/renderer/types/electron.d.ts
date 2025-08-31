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
      savePAT: (pat: string) => Promise<boolean>;
      getPAT: () => Promise<string | null>;
      deletePAT: () => Promise<boolean>;
      hasPAT: () => Promise<boolean>;
      onNotificationUpdate: (callback: (count: number) => void) => void;
      onFocusModeChange: (callback: (mode: string) => void) => void;
    };
  }
}

export {};
