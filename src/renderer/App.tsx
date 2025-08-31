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

    setLoading(true);
    setError(null);
    
    try {
      // Get real notifications from GitHub
      const rawNotifications = await githubService.getNotifications({
        all: false, // Only unread notifications
        participating: false,
        per_page: 100
      });

      // Transform GitHub notifications to our format
      const groupedNotifications = transformGitHubNotifications(rawNotifications);
      setNotifications(groupedNotifications);
      
      // Calculate unread count
      const count = rawNotifications.length;
      setUnreadCount(count);
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
        url: notification.subject.url,
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
      await githubService.markNotificationAsRead(notificationId);
      await loadNotifications(); // Reload to update state
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!githubService) return;
    
    try {
      await githubService.markAllNotificationsAsRead();
      await loadNotifications(); // Reload to update state
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
