import { 
  GitHubNotification, 
  NotificationGroup, 
  GitHubRepository,
  GitHubUser,
  GitHubSubject
} from '../types/notifications';

// Mock data
const mockUsers: GitHubUser[] = [
  { id: 1, login: 'microsoft', avatar_url: 'https://github.com/microsoft.png', type: 'Organization' },
  { id: 2, login: 'facebook', avatar_url: 'https://github.com/facebook.png', type: 'Organization' },
  { id: 3, login: 'johndoe', avatar_url: 'https://github.com/johndoe.png', type: 'User' },
  { id: 4, login: 'reactjs', avatar_url: 'https://github.com/reactjs.png', type: 'Organization' }
];

const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'vscode',
    full_name: 'microsoft/vscode',
    private: false,
    owner: mockUsers[0],
    html_url: 'https://github.com/microsoft/vscode'
  },
  {
    id: 2,
    name: 'typescript',
    full_name: 'microsoft/typescript',
    private: false,
    owner: mockUsers[0],
    html_url: 'https://github.com/microsoft/typescript'
  },
  {
    id: 3,
    name: 'react',
    full_name: 'facebook/react',
    private: false,
    owner: mockUsers[1],
    html_url: 'https://github.com/facebook/react'
  },
  {
    id: 4,
    name: 'personal-project',
    full_name: 'johndoe/personal-project',
    private: true,
    owner: mockUsers[2],
    html_url: 'https://github.com/johndoe/personal-project'
  }
];

const mockSubjects: GitHubSubject[] = [
  {
    title: 'Add support for new TypeScript features',
    url: 'https://api.github.com/repos/microsoft/vscode/issues/123',
    latest_comment_url: 'https://api.github.com/repos/microsoft/vscode/issues/123/comments',
    type: 'Issue'
  },
  {
    title: 'Fix performance regression in editor',
    url: 'https://api.github.com/repos/microsoft/vscode/pulls/456',
    latest_comment_url: null,
    type: 'PullRequest'
  },
  {
    title: 'Update dependencies to latest versions',
    url: 'https://api.github.com/repos/microsoft/typescript/pulls/789',
    latest_comment_url: null,
    type: 'PullRequest'
  },
  {
    title: 'Add new React hooks',
    url: 'https://api.github.com/repos/facebook/react/pulls/101',
    latest_comment_url: 'https://api.github.com/repos/facebook/react/pulls/101/comments',
    type: 'PullRequest'
  },
  {
    title: 'Fix memory leak in component',
    url: 'https://api.github.com/repos/facebook/react/issues/202',
    latest_comment_url: null,
    type: 'Issue'
  },
  {
    title: 'Personal project update',
    url: 'https://api.github.com/repos/johndoe/personal-project/issues/303',
    latest_comment_url: null,
    type: 'Issue'
  }
];

const mockNotifications: GitHubNotification[] = [
  {
    id: '1',
    repository: mockRepositories[0],
    subject: mockSubjects[0],
    reason: 'assign',
    unread: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    last_read_at: null,
    url: 'https://api.github.com/notifications/threads/1',
    html_url: 'https://github.com/notifications/1'
  },
  {
    id: '2',
    repository: mockRepositories[0],
    subject: mockSubjects[1],
    reason: 'review_requested',
    unread: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    last_read_at: null,
    url: 'https://api.github.com/notifications/threads/2',
    html_url: 'https://github.com/notifications/2'
  },
  {
    id: '3',
    repository: mockRepositories[1],
    subject: mockSubjects[2],
    reason: 'mention',
    unread: false,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    last_read_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    url: 'https://api.github.com/notifications/threads/3',
    html_url: 'https://github.com/notifications/3'
  },
  {
    id: '4',
    repository: mockRepositories[2],
    subject: mockSubjects[3],
    reason: 'comment',
    unread: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    last_read_at: null,
    url: 'https://api.github.com/notifications/threads/4',
    html_url: 'https://github.com/notifications/4'
  },
  {
    id: '5',
    repository: mockRepositories[2],
    subject: mockSubjects[4],
    reason: 'assign',
    unread: true,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    last_read_at: null,
    url: 'https://api.github.com/notifications/threads/5',
    html_url: 'https://github.com/notifications/5'
  },
  {
    id: '6',
    repository: mockRepositories[3],
    subject: mockSubjects[5],
    reason: 'subscribed',
    unread: false,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    last_read_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    url: 'https://api.github.com/notifications/threads/6',
    html_url: 'https://github.com/notifications/6'
  }
];

export class MockDataService {
  private notifications: GitHubNotification[] = mockNotifications;

  async getNotifications(): Promise<GitHubNotification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.notifications;
  }

  async getGroupedNotifications(): Promise<NotificationGroup[]> {
    const notifications = await this.getNotifications();
    
    // Group by organization
    const grouped = notifications.reduce((acc, notification) => {
      const orgName = notification.repository.owner.login;
      const repoName = notification.repository.name;
      
      let orgGroup = acc.find(group => group.organization === orgName);
      if (!orgGroup) {
        orgGroup = {
          organization: orgName,
          repositories: []
        };
        acc.push(orgGroup);
      }
      
      let repoGroup = orgGroup.repositories.find(repo => repo.repository.name === repoName);
      if (!repoGroup) {
        repoGroup = {
          repository: notification.repository,
          notifications: []
        };
        orgGroup.repositories.push(repoGroup);
      }
      
      repoGroup.notifications.push(notification);
      return acc;
    }, [] as NotificationGroup[]);
    
    // Sort organizations and repositories
    grouped.sort((a, b) => a.organization.localeCompare(b.organization));
    grouped.forEach(group => {
      group.repositories.sort((a, b) => a.repository.name.localeCompare(b.repository.name));
      group.repositories.forEach(repo => {
        repo.notifications.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      });
    });
    
    return grouped;
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => n.unread).length;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.unread = false;
      notification.last_read_at = new Date().toISOString();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(notification => {
      notification.unread = false;
      notification.last_read_at = new Date().toISOString();
    });
  }

  async filterNotifications(filter: string): Promise<GitHubNotification[]> {
    const notifications = await this.getNotifications();
    
    if (filter === 'unread') {
      return notifications.filter(n => n.unread);
    } else if (filter === 'work') {
      return notifications.filter(n => 
        ['microsoft', 'facebook'].includes(n.repository.owner.login)
      );
    } else if (filter === 'personal') {
      return notifications.filter(n => 
        !['microsoft', 'facebook'].includes(n.repository.owner.login)
      );
    }
    
    return notifications;
  }
}
