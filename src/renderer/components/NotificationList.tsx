import { NotificationGroup } from '../types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationGroup[];
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {notifications.map((group) => (
        <div key={group.repository} className="repository-group">
          <div className="repository-header">
            <h3 className="repository-name">
              <a 
                href={`https://github.com/${group.repository}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="repository-link"
              >
                {group.repository}
              </a>
            </h3>
            <span className="notification-count">
              {group.notifications.length} notification{group.notifications.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="repository-notifications">
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
  );
}
