import { useState, useEffect } from 'react';
import { NotificationGroup, FilterType } from './types/notifications';
import { MockDataService } from './services/mockDataService';
import { NotificationList } from './components/NotificationList';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { SetupWizard } from './components/SetupWizard';
import './App.css';

const mockDataService = new MockDataService();

function App() {
  const [notifications, setNotifications] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (!showSetupWizard && setupComplete) {
      loadNotifications();
    }
  }, [showSetupWizard, setupComplete]);

  const checkSetupStatus = async () => {
    try {
      const hasPAT = await window.electronAPI.hasPAT();
      if (!hasPAT) {
        setShowSetupWizard(true);
      } else {
        setSetupComplete(true);
        setLoading(false);
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
    setLoading(true);
    try {
      const groupedNotifications = await mockDataService.getGroupedNotifications();
      setNotifications(groupedNotifications);
      
      const count = await mockDataService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await mockDataService.markAsRead(notificationId);
      await loadNotifications(); // Reload to update state
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await mockDataService.markAllAsRead();
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
