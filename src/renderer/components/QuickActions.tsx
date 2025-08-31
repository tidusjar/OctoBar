import { AppNotification } from '../types/notifications';

interface QuickActionsProps {
  notification: AppNotification;
  onMarkAsRead: () => void;
  onOpenInBrowser: () => void;
}

export function QuickActions({ notification, onMarkAsRead, onOpenInBrowser }: QuickActionsProps) {
  const handleMuteThread = () => {
    // TODO: Implement mute thread functionality
    console.log('Mute thread:', notification.id);
  };

  const handleStarThread = () => {
    // TODO: Implement star thread functionality
    console.log('Star thread:', notification.id);
  };

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
      
      <button
        className="action-button small"
        onClick={handleMuteThread}
        title="Mute thread"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6"/>
        </svg>
      </button>
      
      <button
        className="action-button small"
        onClick={handleStarThread}
        title="Star thread"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    </div>
  );
}
