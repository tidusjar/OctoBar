

interface HeaderProps {
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
}

export function Header({ unreadCount, onRefresh, onMarkAllAsRead }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="app-title">OctoBar</h1>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>
      
      <div className="header-actions">
        <button 
          className="action-button"
          onClick={onRefresh}
          title="Refresh notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
        
        {unreadCount > 0 && (
          <button 
            className="action-button"
            onClick={onMarkAllAsRead}
            title="Mark all as read"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
