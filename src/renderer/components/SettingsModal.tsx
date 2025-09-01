import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      // Load current PAT
      const currentPAT = await window.electronAPI.getPAT();
      if (currentPAT) {
        setSettings(prev => ({ ...prev, pat: currentPAT }));
      }

      // Load other settings from storage
      const storedSettings = await window.electronAPI.getSettings?.();
      if (storedSettings) {
        setSettings(prev => ({ ...prev, ...storedSettings }));
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
        const success = await window.electronAPI.setPAT(newPAT);
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
      if (window.electronAPI.setSettings) {
        const { pat, ...otherSettings } = settings;
        await window.electronAPI.setSettings(otherSettings);
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
            <h2>Settings</h2>
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
                  />
                  Enable desktop notifications
                </label>
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
