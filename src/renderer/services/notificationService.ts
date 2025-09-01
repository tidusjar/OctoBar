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
    if (!this.settings.enableDesktopNotifications) {
      return;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Desktop notifications are not supported in this browser');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Desktop notification permission denied');
        return;
      }
    }

    // Don't show notification if permission is denied
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon.png', // Use app icon
        tag: data.tag || 'octobar-notification',
        data: data.data,
        requireInteraction: false,
        silent: false
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.warn('Failed to show desktop notification:', error);
    }
  }

  /**
   * Show a notification with both sound and desktop notification
   */
  async notify(data: NotificationData) {
    // Play sound notification
    await this.playNotificationSound();

    // Show desktop notification
    await this.showDesktopNotification(data);
  }

  /**
   * Show notification for new GitHub notifications
   */
  async notifyNewNotifications(count: number, repository?: string) {
    if (count === 0) return;

    const title = count === 1 
      ? 'New GitHub notification' 
      : `${count} new GitHub notifications`;

    const body = repository 
      ? `New notification from ${repository}`
      : count === 1
        ? 'You have a new notification'
        : `You have ${count} new notifications`;

    await this.notify({
      title,
      body,
      tag: 'github-notifications',
      data: { count, repository }
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
}

// Export singleton instance
export const notificationService = new NotificationService();
