interface NotificationSettings {
  enableSound: boolean;
  enableDesktopNotifications: boolean;
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private settings: NotificationSettings = {
    enableSound: true,
    enableDesktopNotifications: true
  };

  private audioContext: AudioContext | null = null;
  private notificationSound: AudioBuffer | null = null;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize the audio context and load notification sound
   */
  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadNotificationSound();
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  /**
   * Load a simple notification sound (generated programmatically)
   */
  private async loadNotificationSound() {
    if (!this.audioContext) return;

    try {
      // Create a simple beep sound
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.3; // 300ms
      const frequency = 800; // 800Hz
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a simple sine wave with fade in/out
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 3); // Exponential decay
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }

      this.notificationSound = buffer;
    } catch (error) {
      console.warn('Failed to create notification sound:', error);
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Play notification sound if enabled
   */
  private async playNotificationSound() {
    if (!this.settings.enableSound || !this.audioContext || !this.notificationSound) {
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.notificationSound;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  /**
   * Show desktop notification if enabled and permission granted
   */
  private async showDesktopNotification(data: NotificationData) {
    console.log('🔔 Attempting to show desktop notification:', data);
    console.log('🔔 Settings:', this.settings);

    if (!this.settings.enableDesktopNotifications) {
      console.log('🔔 Desktop notifications disabled in settings');
      return;
    }

    // Use Electron notifications if available
    if (window.electronAPI?.showNotification) {
      console.log('🔔 Using Electron notification API');
      try {
        const result = await window.electronAPI.showNotification(data.title, data.body, {
          tag: data.tag || 'octobar-notification',
          data: data.data
        });
        console.log('🔔 Electron notification result:', result);
        return result;
      } catch (error) {
        console.error('🔔 Failed to show Electron notification:', error);
        return;
      }
    }

    // Fallback to browser notifications
    console.log('🔔 Using browser notification API (fallback)');
    console.log('🔔 Notification permission:', Notification.permission);

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('🔔 Desktop notifications are not supported in this browser');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Permission result:', permission);
      if (permission !== 'granted') {
        console.warn('🔔 Desktop notification permission denied');
        return;
      }
    }

    // Don't show notification if permission is denied
    if (Notification.permission !== 'granted') {
      console.log('🔔 Notification permission not granted:', Notification.permission);
      return;
    }

    try {
      console.log('🔔 Creating browser notification with options:', {
        title: data.title,
        body: data.body,
        icon: data.icon || './src/renderer/assets/icon.png',
        tag: data.tag || 'octobar-notification',
        data: data.data,
        requireInteraction: false,
        silent: false
      });

      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || './src/renderer/assets/icon.png', // Use app icon
        tag: data.tag || 'octobar-notification',
        data: data.data,
        requireInteraction: false,
        silent: false
      });

      console.log('🔔 Browser notification created successfully:', notification);

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
        console.log('🔔 Notification auto-closed');
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        console.log('🔔 Notification clicked');
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('🔔 Failed to show browser notification:', error);
    }
  }

  /**
   * Show a notification with both sound and desktop notification
   */
  async notify(data: NotificationData) {
    console.log('🔔 Regular notify() called with:', data);
    console.log('🔔 Current settings in notify():', this.settings);
    console.log('🔔 Desktop notifications enabled:', this.settings.enableDesktopNotifications);
    console.log('🔔 Sound notifications enabled:', this.settings.enableSound);
    
    // Play sound notification
    await this.playNotificationSound();

    // Show desktop notification
    await this.showDesktopNotification(data);
  }

  /**
   * Show notification for new GitHub notifications
   */
  async notifyNewNotifications(count: number, repository?: string, newNotifications?: any[]) {
    if (count === 0) return;

    const title = count === 1 
      ? 'New GitHub notification' 
      : `${count} new GitHub notifications`;

    let body = '';
    
    if (newNotifications && newNotifications.length > 0) {
      // Show details of the first few new notifications
      const maxNotifications = Math.min(count, 3);
      const notificationDetails = newNotifications.slice(0, maxNotifications).map(notif => {
        const repoName = notif.repository?.full_name || 'Unknown repository';
        const subjectTitle = notif.subject?.title || 'Unknown notification';
        const type = notif.subject?.type || 'Unknown';
        const reason = notif.reason || 'unknown';
        
        // Truncate long titles
        const truncatedTitle = subjectTitle.length > 50 
          ? subjectTitle.substring(0, 47) + '...' 
          : subjectTitle;
        
        return `• ${type} in ${repoName}: ${truncatedTitle}`;
      }).join('\n');
      
      if (count > maxNotifications) {
        body = `${notificationDetails}\n... and ${count - maxNotifications} more`;
      } else {
        body = notificationDetails;
      }
    } else if (repository) {
      body = `New notification from ${repository}`;
    } else {
      body = count === 1
        ? 'You have a new notification'
        : `You have ${count} new notifications`;
    }

    await this.notify({
      title,
      body,
      tag: 'github-notifications',
      // Only pass simple data to avoid clone errors
      data: { count: count.toString(), repository: repository || '' }
    });
  }

  /**
   * Show notification for notification updates
   */
  async notifyNotificationUpdate(previousCount: number, currentCount: number) {
    const difference = currentCount - previousCount;
    
    if (difference <= 0) return; // Only notify for increases

    await this.notifyNewNotifications(difference);
  }

  /**
   * Check if desktop notifications are supported and permission status
   */
  getNotificationStatus() {
    if (!('Notification' in window)) {
      return {
        supported: false,
        permission: 'unsupported' as const
      };
    }

    return {
      supported: true,
      permission: Notification.permission
    };
  }

  /**
   * Request desktop notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Get current notification settings (for debugging)
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Force show a notification (for debugging) - bypasses settings
   */
  async forceNotify(data: NotificationData) {
    console.log('🔧 Force notification (debug mode):', data);
    
    // Use Electron notifications if available
    if (window.electronAPI?.showNotification) {
      console.log('🔧 Using Electron notification API for force notification');
      try {
        const result = await window.electronAPI.showNotification(data.title, data.body, {
          tag: data.tag || 'octobar-debug',
          data: data.data
        });
        console.log('🔧 Electron force notification result:', result);
        return result;
      } catch (error) {
        console.error('🔧 Failed to show Electron force notification:', error);
        return;
      }
    }

    // Fallback to browser notifications
    console.log('🔧 Using browser notification API for force notification (fallback)');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('🔧 Desktop notifications are not supported in this browser');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      console.log('🔧 Requesting permission for force notification...');
      const permission = await Notification.requestPermission();
      console.log('🔧 Permission result:', permission);
      if (permission !== 'granted') {
        console.warn('🔧 Desktop notification permission denied');
        return;
      }
    }

    // Don't show notification if permission is denied
    if (Notification.permission !== 'granted') {
      console.log('🔧 Notification permission not granted:', Notification.permission);
      return;
    }

    try {
      console.log('🔧 Creating force notification with options:', {
        title: data.title,
        body: data.body,
        icon: data.icon || './src/renderer/assets/icon.png',
        tag: data.tag || 'octobar-debug',
        data: data.data,
        requireInteraction: false,
        silent: false
      });

      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || './src/renderer/assets/icon.png',
        tag: data.tag || 'octobar-debug',
        data: data.data,
        requireInteraction: false,
        silent: false
      });

      console.log('🔧 Force notification created successfully:', notification);

      // Auto-close notification after 10 seconds (longer for debugging)
      setTimeout(() => {
        notification.close();
        console.log('🔧 Force notification auto-closed');
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        console.log('🔧 Force notification clicked');
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('🔧 Failed to show force notification:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
