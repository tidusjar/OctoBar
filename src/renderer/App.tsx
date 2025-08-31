import { useState, useEffect } from 'react';
import { NotificationGroup, FilterType } from './types/notifications';
import { MockDataService } from './services/mockDataService';
import { NotificationList } from './components/NotificationList';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import './App.css';

const mockDataService = new MockDataService();

function App() {
  const [notifications, setNotifications] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

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
