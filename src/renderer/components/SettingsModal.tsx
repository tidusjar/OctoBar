import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: () => void;
  onDebugRefresh?: () => void;
}

interface Settings {
  pat: string;
  refreshInterval: number;
  showUnreadOnly: boolean;
  enableSound: boolean;
  enableDesktopNotifications: boolean;
  autoStart: boolean;
  theme: 'light' | 'dark' | 'system';
}

export function SettingsModal({ isOpen, onClose, onSettingsChange, onDebugRefresh }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    pat: '',
    refreshInterval: 5,
    showUnreadOnly: true,
    enableSound: true,
    enableDesktopNotifications: true,
    autoStart: false,
    theme: 'system'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPATInput, setShowPATInput] = useState(false);
  const [newPAT, setNewPAT] = useState('');
  const [patError, setPatError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [debugMode, setDebugMode] = useState(false);
  const [titleClickCount, setTitleClickCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, theme]);

  const loadSettings = async () => {
    try {
      // Load current PAT
      const currentPAT = await window.electronAPI.getPAT();
      if (currentPAT) {
        setSettings(prev => ({ ...prev, pat: currentPAT }));
      }

      // Load other settings from storage
      const storedSettings = await (window.electronAPI as any).getSettings?.();
      if (storedSettings) {
        setSettings(prev => ({ ...prev, ...storedSettings }));
      }
      
      // Update local settings with current theme from context
      setSettings(prev => ({ ...prev, theme }));

      // Check notification permission status
      const status = notificationService.getNotificationStatus();
      if (status.supported) {
        setNotificationPermission(status.permission);
      } else {
        setNotificationPermission('denied');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Save PAT if changed
      if (newPAT && newPAT !== settings.pat) {
        const success = await (window.electronAPI as any).setPAT(newPAT);
        if (success) {
          setSettings(prev => ({ ...prev, pat: newPAT }));
          setNewPAT('');
          setShowPATInput(false);
          setPatError('');
        } else {
          setPatError('Failed to save PAT. Please try again.');
          return;
        }
      }

      // Save other settings
      if ((window.electronAPI as any).setSettings) {
        const { pat, ...otherSettings } = settings;
        await (window.electronAPI as any).setSettings(otherSettings);
      }

      // Notify parent component that settings have changed
      if (onSettingsChange) {
        onSettingsChange();
      }

      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewPAT('');
    setShowPATInput(false);
    setPatError('');
    onClose();
  };

  const validatePAT = (pat: string): boolean => {
    if (!pat || pat.length < 40) {
      setPatError('PAT must be at least 40 characters long');
      return false;
    }
    if (!pat.startsWith('ghp_') && !pat.startsWith('github_pat_')) {
      setPatError('PAT must start with "ghp_" or "github_pat_"');
      return false;
    }
    setPatError('');
    return true;
  };

  const handlePATChange = (value: string) => {
    setNewPAT(value);
    if (value) {
      validatePAT(value);
    } else {
      setPatError('');
    }
  };

  const handleRefreshIntervalChange = (value: number) => {
    setSettings(prev => ({ ...prev, refreshInterval: value }));
  };

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle theme change immediately
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
  };

  const handleRequestNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Test notification
        await notificationService.notify({
          title: 'OctoBar',
          body: 'Desktop notifications are now enabled!',
          tag: 'permission-test'
        });
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleTitleClick = () => {
    const newCount = titleClickCount + 1;
    setTitleClickCount(newCount);
    
    if (newCount >= 5) {
      setDebugMode(true);
      setTitleClickCount(0);
      console.log('🔧 Debug mode activated!');
    }
  };

  const handleDebugTestNotification = async () => {
    await notificationService.notify({
      title: 'Debug Test',
      body: 'This is a test notification from debug mode!',
      tag: 'debug-test'
    });
  };

  const handleDebugForceNotification = async () => {
    await notificationService.forceNotify({
      title: 'Force Debug Test',
      body: 'This is a force notification that bypasses settings!',
      tag: 'debug-force-test'
    });
  };

  const handleDebugTestSound = async () => {
    await notificationService.notify({
      title: 'Debug Sound Test',
      body: 'Testing sound notification...',
      tag: 'debug-sound-test'
    });
  };

  const handleDebugTestNewNotifications = async () => {
    await notificationService.notifyNewNotifications(3, 'octobar/debug-repo');
  };

  const handleDebugRefresh = () => {
    if (onDebugRefresh) {
      onDebugRefresh();
    }
  };

  const handleDebugLogSettings = () => {
    console.log('🔧 Debug: Current settings:', settings);
    console.log('🔧 Debug: Notification permission:', notificationPermission);
    console.log('🔧 Debug: Notification service status:', notificationService.getNotificationStatus());
    console.log('🔧 Debug: Browser Notification API available:', 'Notification' in window);
    console.log('🔧 Debug: Current Notification.permission:', Notification.permission);
    
    // Check notification service internal settings
    console.log('🔧 Debug: Notification service settings (internal):', notificationService.getSettings());
  };

  const handleDebugCheckPermission = async () => {
    console.log('🔧 Debug: Checking notification permission...');
    const status = notificationService.getNotificationStatus();
    console.log('🔧 Debug: Notification status:', status);
    
    if (status.supported && status.permission === 'default') {
      console.log('🔧 Debug: Requesting permission...');
      const permission = await notificationService.requestPermission();
      console.log('🔧 Debug: Permission result:', permission);
      setNotificationPermission(permission);
    } else {
      console.log('🔧 Debug: Permission already set to:', status.permission);
    }
  };

  const handleDebugTestAllNotifications = async () => {
    console.log('🔧 Debug: Testing all notification types...');
    
    // Test basic notification
    await notificationService.notify({
      title: 'Debug: Basic Test',
      body: 'Testing basic notification functionality',
      tag: 'debug-basic'
    });

    // Wait a bit, then test sound
    setTimeout(async () => {
      await notificationService.notify({
        title: 'Debug: Sound Test',
        body: 'Testing sound notification',
        tag: 'debug-sound'
      });
    }, 1000);

    // Wait a bit more, then test new notifications
    setTimeout(async () => {
      await notificationService.notifyNewNotifications(2, 'debug/test-repo');
    }, 2000);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div
          className="modal-content settings-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 
              className={debugMode ? 'debug-mode-active' : ''}
              onClick={handleTitleClick}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title={debugMode ? 'Debug mode active' : 'Click 5 times to activate debug mode'}
            >
              Settings
              {debugMode && <span className="debug-indicator"> 🔧</span>}
            </h2>
            <button 
              className="modal-close-button"
              onClick={handleCancel}
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <div className="settings-section">
              <h3>GitHub Authentication</h3>
              <div className="setting-item">
                <label>Personal Access Token</label>
                <div className="pat-controls">
                  {!showPATInput ? (
                    <div className="pat-display">
                      <span className="pat-masked">
                        {settings.pat ? '••••••••••••••••••••••••••••••••••••••••' : 'Not set'}
                      </span>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowPATInput(true)}
                      >
                        {settings.pat ? 'Change' : 'Set'}
                      </button>
                    </div>
                  ) : (
                    <div className="pat-input-group">
                      <input
                        type="password"
                        value={newPAT}
                        onChange={(e) => handlePATChange(e.target.value)}
                        placeholder="Enter your GitHub Personal Access Token"
                        className={patError ? 'input-error' : ''}
                      />
                      {patError && <div className="error-message">{patError}</div>}
                      <div className="pat-input-actions">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setShowPATInput(false);
                            setNewPAT('');
                            setPatError('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="setting-help">
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Generate a new token →
                  </a>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="setting-item">
                <label>Refresh Interval</label>
                <select 
                  value={settings.refreshInterval}
                  onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                >
                  <option value={1}>Every 1 minute</option>
                  <option value={5}>Every 5 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every hour</option>
                </select>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.showUnreadOnly}
                    onChange={(e) => handleSettingChange('showUnreadOnly', e.target.checked)}
                  />
                  Show unread notifications only
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => handleSettingChange('enableSound', e.target.checked)}
                  />
                  Enable sound notifications
                </label>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableDesktopNotifications}
                    onChange={(e) => handleSettingChange('enableDesktopNotifications', e.target.checked)}
                    disabled={notificationPermission === 'denied' || notificationPermission === 'unsupported'}
                  />
                  Enable desktop notifications
                </label>
                {notificationPermission === 'denied' && (
                  <div className="setting-help error">
                    Desktop notifications are blocked. Please enable them in your browser settings.
                  </div>
                )}
                {notificationPermission === 'unsupported' && (
                  <div className="setting-help error">
                    Desktop notifications are not supported in this browser.
                  </div>
                )}
                {notificationPermission === 'default' && (
                  <div className="setting-help">
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleRequestNotificationPermission}
                    >
                      Grant Permission
                    </button>
                    <span>Click to allow desktop notifications</span>
                  </div>
                )}
                {notificationPermission === 'granted' && (
                  <div className="setting-help success">
                    ✓ Desktop notifications are enabled
                  </div>
                )}
              </div>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>
              <div className="setting-item">
                <label>Theme</label>
                <select 
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Behavior</h3>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoStart}
                    onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                  />
                  Start OctoBar automatically on system startup
                </label>
              </div>
            </div>

            {debugMode && (
              <div className="settings-section debug-section">
                <h3>🔧 Debug Tools</h3>
                <div className="debug-buttons">
                  <div className="debug-button-group">
                    <h4>Notifications</h4>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugTestNotification}
                      title="Test desktop notification"
                    >
                      Test Notification
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugForceNotification}
                      title="Force notification (bypasses settings)"
                    >
                      Force Notification
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugTestSound}
                      title="Test sound notification"
                    >
                      Test Sound
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugTestNewNotifications}
                      title="Test new notifications alert"
                    >
                      Test New Notifications
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugTestAllNotifications}
                      title="Test all notification types in sequence"
                    >
                      Test All Notifications
                    </button>
                  </div>
                  
                  <div className="debug-button-group">
                    <h4>System</h4>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugRefresh}
                      title="Trigger manual refresh"
                    >
                      Force Refresh
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugLogSettings}
                      title="Log current settings to console"
                    >
                      Log Settings
                    </button>
                    <button 
                      className="btn btn-debug"
                      onClick={handleDebugCheckPermission}
                      title="Check and request notification permission"
                    >
                      Check Permission
                    </button>
                  </div>
                </div>
                <div className="debug-info">
                  <small>Debug mode activated. These buttons help test notification functionality.</small>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving || (showPATInput && !newPAT) || (showPATInput && !!patError)}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
