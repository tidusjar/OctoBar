import { AppNotification } from '../types/notifications';
import { QuickActions } from './QuickActions';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'assign': return '👤';
      case 'author': return '✍️';
      case 'comment': return '💬';
      case 'invitation': return '📨';
      case 'manual': return '🔔';
      case 'mention': return '📢';
      case 'push': return '⬆️';
      case 'review_requested': return '👀';
      case 'security_alert': return '⚠️';
      case 'state_change': return '🔄';
      case 'subscribed': return '⭐';
      case 'team_mention': return '👥';
      default: return '📌';
    }
  };

  const getSubjectIcon = (type: string) => {
    switch (type) {
      case 'Issue': return '🐛';
      case 'PullRequest': return '🔀';
      case 'Commit': return '💾';
      case 'Release': return '🏷️';
      case 'Discussion': return '💭';
      default: return '📝';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleOpenInBrowser = async () => {
    try {
      // Open in default browser
      await window.electronAPI.openInBrowser(notification.url);
      
      // Mark as read locally and sync with GitHub
      // This gives the user immediate feedback that they've "handled" this notification
      onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Failed to open notification in browser:', error);
      // Fallback to regular window.open if electron API fails
      window.open(notification.url, '_blank');
    }
  };

  return (
    <div className={`notification-item ${notification.unread ? 'unread' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-icons">
            <span className="reason-icon" title={notification.reason}>
              {getReasonIcon(notification.reason)}
            </span>
            <span className="subject-icon" title={notification.type}>
              {getSubjectIcon(notification.type)}
            </span>
          </div>
          
          <div className="notification-meta">
            <span className="notification-time">
              {formatRelativeTime(notification.updatedAt)}
            </span>
            {!notification.unread && (
              <span className="read-indicator">✓</span>
            )}
          </div>
        </div>
        
        <div className="notification-title">
          <button 
            onClick={handleOpenInBrowser}
            className="title-button"
            title="Open in browser (marks as read)"
          >
            {notification.title}
          </button>
        </div>
        
        <div className="notification-repository">
          {notification.repository}
          <span className="reason-badge" title={notification.reason}>
            {notification.reason.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <QuickActions
        notification={notification}
        onMarkAsRead={handleMarkAsRead}
        onOpenInBrowser={handleOpenInBrowser}
      />
    </div>
  );
}
