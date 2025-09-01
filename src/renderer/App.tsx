import { useState, useEffect } from 'react';
import { NotificationGroup, FilterType } from './types/notifications';
import { GitHubService } from './services/githubService';
import { NotificationList } from './components/NotificationList';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { SetupWizard } from './components/SetupWizard';
import { FilterSettingsModal } from './components/FilterSettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { useBackgroundRefresh } from './hooks/useBackgroundRefresh';
import { notificationService } from './services/notificationService';
import './App.css';

function App() {
  const [notifications, setNotifications] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [githubService, setGithubService] = useState<GitHubService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // Default 5 minutes
  const [notificationSettings, setNotificationSettings] = useState({
    enableSound: true,
    enableDesktopNotifications: true
  });
  const [previousNotificationCount, setPreviousNotificationCount] = useState<number>(0);

  // Background refresh hook
  useBackgroundRefresh({
    refreshInterval,
    onRefresh: () => loadNotifications(),
    enabled: setupComplete && !!githubService
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  // Initialize notification service settings
  useEffect(() => {
    notificationService.updateSettings(notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    if (!showSetupWizard && setupComplete && githubService) {
      // Load settings first, then filter settings, then notifications
      loadSettings().then(() => {
        loadFilterSettings().then(() => {
          loadNotifications();
        });
      });
    }
  }, [showSetupWizard, setupComplete, githubService]);

  const checkSetupStatus = async () => {
    try {
      const hasPAT = await window.electronAPI.hasPAT();
      if (!hasPAT) {
        setShowSetupWizard(true);
      } else {
        // Initialize GitHub service with stored PAT
        const pat = await window.electronAPI.getPAT();
        if (pat) {
          const service = new GitHubService(pat);
          setGithubService(service);
          setSetupComplete(true);
          setLoading(false);
        } else {
          setShowSetupWizard(true);
        }
      }
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setShowSetupWizard(true);
    }
  };

  const loadSettings = async () => {
    try {
      console.log('⚙️ Loading app settings...');
      if ((window.electronAPI as any)?.getSettings) {
        const settings = await (window.electronAPI as any).getSettings();
        
        // Load refresh interval
        if (settings?.refreshInterval) {
          setRefreshInterval(settings.refreshInterval);
          console.log(`✅ Refresh interval loaded: ${settings.refreshInterval} minutes`);
        } else {
          console.log('ℹ️ No refresh interval found in settings, using default: 5 minutes');
        }

        // Load notification settings
        if (settings?.enableSound !== undefined || settings?.enableDesktopNotifications !== undefined) {
          const newNotificationSettings = {
            enableSound: settings.enableSound ?? true,
            enableDesktopNotifications: settings.enableDesktopNotifications ?? true
          };
          setNotificationSettings(newNotificationSettings);
          notificationService.updateSettings(newNotificationSettings);
          console.log('✅ Notification settings loaded:', newNotificationSettings);
        } else {
          console.log('ℹ️ No notification settings found, using defaults');
        }
      } else {
        console.log('❌ getSettings method not available');
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    }
  };

  const handleSetupComplete = async () => {
    try {
      // Save the PAT that was entered during setup
      const pat = await window.electronAPI.getPAT();
      if (pat) {
        console.log('Setup completed successfully. PAT saved and retrieved.');
        const service = new GitHubService(pat);
        setGithubService(service);
        setShowSetupWizard(false);
        setSetupComplete(true);
        setLoading(false);
      } else {
        console.error('No PAT found after setup completion');
      }
    } catch (error) {
      console.error('Failed to complete setup:', error);
    }
  };

  const loadNotifications = async (customFilterOrgs?: string[], customFilterRepos?: string[]) => {
    if (!githubService) {
      console.error('GitHub service not initialized');
      return;
    }

    console.log('🔄 Loading notifications from GitHub API...');
    setLoading(true);
    setError(null);
    
    try {
      // Get real notifications from GitHub with cache busting
      const params = {
        all: false, // Only unread notifications
        participating: false,
        per_page: 100,
        // Add a timestamp to ensure fresh data
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Get notifications from last 7 days
      };
      
      // Use custom filter parameters if provided, otherwise use current state
      const filterOrgs = customFilterOrgs !== undefined ? customFilterOrgs : selectedOrgs;
      const filterRepos = customFilterRepos !== undefined ? customFilterRepos : selectedRepos;
      
      // Add filter parameters to the API call
      const apiParams = {
        ...params,
        filterOrgs: filterOrgs,
        filterRepos: filterRepos
      };
      
      const rawNotifications = await githubService.getNotifications(apiParams);
      console.log(`📨 Received ${rawNotifications.length} notifications from GitHub`);

      // Transform GitHub notifications to our format
      const groupedNotifications = transformGitHubNotifications(rawNotifications);
      setNotifications(groupedNotifications);
      
      // Calculate unread count
      const count = rawNotifications.length;
      setUnreadCount(count);
      console.log(`✅ Loaded ${count} unread notifications, grouped into ${groupedNotifications.length} repositories`);

      // Check for new notifications and trigger alerts
      if (previousNotificationCount > 0 && count > previousNotificationCount) {
        const newNotifications = count - previousNotificationCount;
        console.log(`🔔 ${newNotifications} new notifications detected`);
        
        // Show notification for new notifications
        await notificationService.notifyNewNotifications(newNotifications);
      }
      
      // Update previous count for next comparison
      setPreviousNotificationCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      if (error instanceof Error) {
        setError(`Failed to load notifications: ${error.message}`);
      } else {
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const transformGitHubNotifications = (rawNotifications: any[]): NotificationGroup[] => {
    // Helper function to build the HTML URL for a notification
    const buildNotificationUrl = (notification: any): string => {
      const repoName = notification.repository.full_name;
      const subjectType = notification.subject.type;
      const subjectUrl = notification.subject.url;
      
      // Extract the number from the API URL (e.g., /repos/owner/repo/issues/123)
      const urlParts = subjectUrl.split('/');
      const number = urlParts[urlParts.length - 1];
      
      // Build the HTML URL based on the subject type
      switch (subjectType) {
        case 'Issue':
          return `https://github.com/${repoName}/issues/${number}`;
        case 'PullRequest':
          return `https://github.com/${repoName}/pull/${number}`;
        case 'Commit':
          return `https://github.com/${repoName}/commit/${number}`;
        case 'Release':
          return `https://github.com/${repoName}/releases/tag/${number}`;
        case 'Discussion':
          return `https://github.com/${repoName}/discussions/${number}`;
        default:
          return `https://github.com/${repoName}`;
      }
    };

    // Group notifications by repository
    const grouped: { [key: string]: any[] } = {};
    
    rawNotifications.forEach(notification => {
      const repoName = notification.repository.full_name;
      if (!grouped[repoName]) {
        grouped[repoName] = [];
      }
      grouped[repoName].push({
        id: notification.id.toString(),
        title: notification.subject.title,
        type: notification.subject.type,
        repository: notification.repository.full_name,
        updatedAt: notification.updated_at,
        unread: !notification.read_at,
        url: buildNotificationUrl(notification), // Build proper HTML URL
        reason: notification.reason
      });
    });

    // Convert to array format
    return Object.entries(grouped).map(([repoName, notifications]) => ({
      repository: repoName,
      notifications: notifications.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }));
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  // Filter notifications based on the selected filter type
  const getFilteredNotifications = (): NotificationGroup[] => {
    if (filter === 'all') {
      return notifications;
    }

    return notifications.map(group => ({
      ...group,
      notifications: group.notifications.filter(notification => {
        const reason = notification.reason;
        
        switch (filter) {
          case 'mentions':
            return reason === 'mention' || reason === 'team_mention';
          case 'reviews':
            return reason === 'review_requested';
          case 'assignments':
            return reason === 'assign';
          case 'comments':
            return reason === 'comment' || reason === 'subscribed';
          case 'security':
            return reason === 'security_alert';
          case 'other':
            return !['mention', 'team_mention', 'review_requested', 'assign', 'comment', 'subscribed', 'security_alert'].includes(reason);
          default:
            return true;
        }
      })
    })).filter(group => group.notifications.length > 0);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!githubService) return;
    
    try {
      // Mark as read on GitHub
      await githubService.markNotificationAsRead(notificationId);
      
      // Update local state immediately
      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(group => ({
          ...group,
          notifications: group.notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, unread: false }
              : notification
          )
        }));
        
        // Remove repository groups that have no unread notifications
        return updated.filter(group => 
          group.notifications.some(notification => notification.unread)
        );
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!githubService) return;
    
    try {
      // Mark all as read on GitHub
      await githubService.markAllNotificationsAsRead();
      
      // Update local state immediately - clear all notifications since they're all read
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const loadFilterSettings = async () => {
    try {
      console.log('�� Attempting to load filter settings...');
      if (window.electronAPI && (window.electronAPI as any).getFilterSettings) {
        console.log('✅ getFilterSettings method available');
        const filterSettings = await (window.electronAPI as any).getFilterSettings();
        console.log('📋 Raw filter settings from storage:', filterSettings);
        if (filterSettings) {
          setSelectedOrgs(filterSettings.organizations);
          setSelectedRepos(filterSettings.repositories);
          console.log('✅ Filter settings loaded successfully:', {
            organizations: filterSettings.organizations,
            repositories: filterSettings.repositories
          });
        } else {
          console.log('ℹ️ No filter settings found in storage');
        }
      } else {
        console.log('❌ getFilterSettings method not available');
      }
    } catch (error) {
      console.error('❌ Failed to load filter settings:', error);
    }
  };

  
const handleOpenSettings = () => {
  setShowFilterSettings(true);
};

const handleOpenGeneralSettings = () => {
  setShowGeneralSettings(true);
};

const handleQuit = () => {
  if (window.electronAPI && (window.electronAPI as any).quit) {
    (window.electronAPI as any).quit();
  }
};

const handleSaveFilterSettings = async (newSelectedOrgs: string[], newSelectedRepos: string[]) => {
  try {
    if (window.electronAPI && (window.electronAPI as any).saveFilterSettings) {
      const success = await (window.electronAPI as any).saveFilterSettings(newSelectedOrgs, newSelectedRepos);
      if (success) {
        setSelectedOrgs(newSelectedOrgs);
        setSelectedRepos(newSelectedRepos);
        console.log('Filter settings saved successfully');
        
        // Refresh notifications with the new filters immediately
        await loadNotifications(newSelectedOrgs, newSelectedRepos);
      } else {
        console.error('Failed to save filter settings');
      }
    }
  } catch (error) {
    console.error('Error saving filter settings:', error);
  }
};

const handleSettingsChange = async () => {
  // Reload settings when they change to update refresh interval
  await loadSettings();
};

  // Show setup wizard if needed
  if (showSetupWizard) {
    return (
      <ThemeProvider>
        <SetupWizard onComplete={handleSetupComplete} />
      </ThemeProvider>
    );
  }

  // Show loading state while checking setup
  if (!setupComplete) {
    return (
      <ThemeProvider>
        <div className="app">
          <div className="loading">
            <div className="spinner"></div>
            <span>Checking setup...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app">
        <Header 
          unreadCount={unreadCount}
          onRefresh={handleRefresh}
          onMarkAllAsRead={handleMarkAllAsRead}
          onOpenSettings={handleOpenSettings}
          onOpenGeneralSettings={handleOpenGeneralSettings}
          onQuit={handleQuit}
        />
        
        <FilterBar 
          currentFilter={filter}
          onFilterChange={handleFilterChange}
        />
        
        <main className="main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="error-display">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Notifications</h3>
              <p>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => loadNotifications()}
              >
                Try Again
              </button>
            </div>
          ) : (
            <NotificationList 
              notifications={getFilteredNotifications()}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        </main>
        <FilterSettingsModal
          isOpen={showFilterSettings}
          onClose={() => setShowFilterSettings(false)}
          onSave={handleSaveFilterSettings}
          initialSelectedOrgs={selectedOrgs}
          initialSelectedRepos={selectedRepos}
        />
        <SettingsModal
          isOpen={showGeneralSettings}
          onClose={() => setShowGeneralSettings(false)}
          onSettingsChange={handleSettingsChange}
          onDebugRefresh={handleRefresh}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
