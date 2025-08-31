import { useState, useEffect } from 'react';
import { NotificationGroup, FilterType } from './types/notifications';
import { GitHubService } from './services/githubService';
import { NotificationList } from './components/NotificationList';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { SetupWizard } from './components/SetupWizard';
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

  useEffect(() => {
    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (!showSetupWizard && setupComplete && githubService) {
      loadNotifications();
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

  const loadNotifications = async () => {
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
      
      console.log('📡 API parameters:', params);
      const rawNotifications = await githubService.getNotifications(params);
      console.log(`📨 Received ${rawNotifications.length} notifications from GitHub`);

      // Transform GitHub notifications to our format
      const groupedNotifications = transformGitHubNotifications(rawNotifications);
      setNotifications(groupedNotifications);
      
      // Calculate unread count
      const count = rawNotifications.length;
      setUnreadCount(count);
      console.log(`✅ Loaded ${count} unread notifications, grouped into ${groupedNotifications.length} repositories`);
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

  // Show setup wizard if needed
  if (showSetupWizard) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  // Show loading state while checking setup
  if (!setupComplete) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <span>Checking setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        unreadCount={unreadCount}
        onRefresh={handleRefresh}
        onMarkAllAsRead={handleMarkAllAsRead}
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
              onClick={loadNotifications}
            >
              Try Again
            </button>
          </div>
        ) : (
          <NotificationList 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      </main>
    </div>
  );
}

export default App;
