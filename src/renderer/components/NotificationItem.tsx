import { AppNotification } from '../types/notifications';
import { QuickActions } from './QuickActions';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (notificationId: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'assign': return 'ASSIGN';
      case 'author': return 'AUTHOR';
      case 'comment': return 'COMMENT';
      case 'invitation': return 'INVITE';
      case 'manual': return 'BELL';
      case 'mention': return 'MENTION';
      case 'push': return 'PUSH';
      case 'review_requested': return 'REVIEW';
      case 'security_alert': return 'SECURITY';
      case 'state_change': return 'CHANGE';
      case 'subscribed': return 'WATCH';
      case 'team_mention': return 'TEAM';
      default: return 'NOTIFY';
    }
  };

  const getSubjectIcon = (type: string) => {
    switch (type) {
      case 'Issue': return 'ISSUE';
      case 'PullRequest': return 'PR';
      case 'Commit': return 'COMMIT';
      case 'Release': return 'RELEASE';
      case 'Discussion': return 'DISCUSS';
      default: return 'ITEM';
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
    <div className={`notification-card ${notification.unread ? 'unread' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-type">
            <span className="type-icon" title={`${notification.reason} - ${notification.type}`}>
              {getReasonIcon(notification.reason)}
            </span>
            <span className="subject-icon" title={notification.type}>
              {getSubjectIcon(notification.type)}
            </span>
          </div>
          
          <div className="notification-meta">
            <span className="time-badge">
              {formatRelativeTime(notification.updatedAt)}
            </span>
            {notification.unread && (
              <div className="unread-indicator"></div>
            )}
          </div>
        </div>
        
        <div className="notification-body">
          <h4 className="notification-title">
            <button 
              onClick={handleOpenInBrowser}
              className="title-link"
              title="Open in browser (marks as read)"
            >
              {notification.title}
            </button>
          </h4>
        </div>
      </div>
      
      <div className="notification-actions">
        <QuickActions
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onOpenInBrowser={handleOpenInBrowser}
        />
      </div>
    </div>
  );
}
