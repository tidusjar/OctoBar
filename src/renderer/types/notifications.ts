export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  type: 'User' | 'Organization';
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
}

export interface GitHubSubject {
  title: string;
  url: string;
  latest_comment_url: string | null;
  type: 'Issue' | 'PullRequest' | 'Commit' | 'Release' | 'Discussion';
}

export interface GitHubNotification {
  id: string;
  repository: GitHubRepository;
  subject: GitHubSubject;
  reason: 'assign' | 'author' | 'comment' | 'invitation' | 'manual' | 'mention' | 'push' | 'review_requested' | 'security_alert' | 'state_change' | 'subscribed' | 'team_mention';
  unread: boolean;
  updated_at: string;
  last_read_at: string | null;
  url: string;
  html_url: string;
}

export interface NotificationGroup {
  organization: string;
  repositories: RepositoryNotifications[];
}

export interface RepositoryNotifications {
  repository: GitHubRepository;
  notifications: GitHubNotification[];
}

export type FilterType = 'work' | 'personal' | 'all';

export interface NotificationFilters {
  type: FilterType;
  organizations: string[];
  repositories: string[];
  reasons: string[];
  unreadOnly: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: (notification: GitHubNotification) => void;
  disabled?: boolean;
}

export interface FocusMode {
  mode: 'work' | 'personal' | 'none';
  startTime?: string;
  endTime?: string;
  organizations?: string[];
}
