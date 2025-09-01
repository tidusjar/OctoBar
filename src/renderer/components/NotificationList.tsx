import { NotificationGroup } from '../types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationGroup[];
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  const handleRepositoryClick = async (repositoryUrl: string) => {
    try {
      // Open in default browser using Electron API
      await window.electronAPI.openInBrowser(repositoryUrl);
    } catch (error) {
      console.error('Failed to open repository in browser:', error);
      // Fallback to regular window.open if electron API fails
      window.open(repositoryUrl, '_blank');
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✨</div>
        <h3>All caught up!</h3>
        <p>No new notifications to show</p>
      </div>
    );
  }

  const totalNotifications = notifications.reduce((total, group) => total + group.notifications.length, 0);
  const totalUnread = notifications.reduce((total, group) => 
    total + group.notifications.filter(n => n.unread).length, 0
  );

  return (
    <div className="notification-list">
      <div className="list-header">
        <div className="list-stats">
          <span className="total-count">{totalNotifications}</span>
          <span className="count-label">notifications</span>
          {totalUnread > 0 && (
            <span className="unread-badge">{totalUnread} unread</span>
          )}
        </div>
      </div>
      
      <div className="notifications-container">
        {notifications.map((group) => (
          <div key={group.repository} className="repository-card">
            <div className="repository-header">
              <div className="repository-info">
                <h3 className="repository-name">
                  <button 
                    onClick={() => handleRepositoryClick(`https://github.com/${group.repository}`)}
                    className="repository-link"
                    title="Open repository in browser"
                  >
                    {group.repository}
                  </button>
                </h3>
                <span className="notification-count">
                  {group.notifications.length}
                </span>
              </div>
            </div>
            
            <div className="notifications-list">
              {group.notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
