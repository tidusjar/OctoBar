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
        <div key={group.organization} className="organization-group">
          <div className="organization-header">
            <h3 className="organization-name">{group.organization}</h3>
          </div>
          
          {group.repositories.map((repo) => (
            <div key={repo.repository.id} className="repository-group">
              <div className="repository-header">
                <h4 className="repository-name">
                  <a 
                    href={repo.repository.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="repository-link"
                  >
                    {repo.repository.name}
                  </a>
                </h4>
                <span className="notification-count">
                  {repo.notifications.length} notification{repo.notifications.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="repository-notifications">
                {repo.notifications.map((notification) => (
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
      ))}
    </div>
  );
}
