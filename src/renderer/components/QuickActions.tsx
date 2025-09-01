import { AppNotification } from '../types/notifications';

interface QuickActionsProps {
  notification: AppNotification;
  onMarkAsRead: () => void;
  onOpenInBrowser: () => void;
}

export function QuickActions({ notification, onMarkAsRead, onOpenInBrowser }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      {notification.unread && (
        <button
          className="action-button small"
          onClick={onMarkAsRead}
          title="Mark as read"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
          </svg>
        </button>
      )}
      
      <button
        className="action-button small"
        onClick={onOpenInBrowser}
        title="Open in browser"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </button>
    </div>
  );
}
