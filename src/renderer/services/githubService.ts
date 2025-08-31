interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string;
  html_url: string;
  updated_at: string;
}

interface GitHubOrganization {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  description: string;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token: string | null = null;

  constructor(token?: string) {
    if (token) {
      this.token = token;
    }
  }

  /**
   * Set the GitHub token for API calls
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the authorization headers for API calls
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'OctoBar/1.0.0'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Validate the GitHub PAT token by making a test API call and checking permissions
   */
  async validateToken(token: string): Promise<{ 
    valid: boolean; 
    user?: GitHubUser; 
    error?: string;
    hasNotificationsAccess?: boolean;
    scopes?: string[];
  }> {
    try {
      // Set the token temporarily for this validation
      const tempService = new GitHubService(token);
      
      // Make a test API call to get the authenticated user
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: tempService.getHeaders()
      });

      if (response.status === 401) {
        return { valid: false, error: 'Invalid token - authentication failed' };
      }

      if (response.status === 403) {
        return { valid: false, error: 'Token lacks required permissions' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          valid: false, 
          error: `API error: ${response.status} ${errorData.message || response.statusText}` 
        };
      }

      const user = await response.json();
      
      // Check what scopes the token has
      const scopes = response.headers.get('x-oauth-scopes')?.split(',').map(s => s.trim()) || [];
      
      // Test notifications access
      let hasNotificationsAccess = false;
      try {
        const notificationsResponse = await fetch(`${this.baseUrl}/notifications?per_page=1`, {
          method: 'GET',
          headers: tempService.getHeaders()
        });
        
        hasNotificationsAccess = notificationsResponse.status === 200;
      } catch (error) {
        // If notifications endpoint fails, assume no access
        hasNotificationsAccess = false;
      }

      // Check if token has required scopes for notifications
      // The token needs at least one of these scope combinations:
      // 1. 'notifications' - direct notifications access
      // 2. 'repo' - includes notifications access
      // 3. 'read:org' + 'notifications' - org access + notifications
      const hasNotificationsScope = scopes.includes('notifications');
      const hasRepoScope = scopes.includes('repo') || scopes.includes('admin:repo');
      const hasOrgScope = scopes.includes('read:org') || scopes.includes('admin:org');
      
      // Token is valid if it has notifications access OR has repo scope (which includes notifications)
      const hasValidScopeCombination = hasNotificationsScope || hasRepoScope || (hasOrgScope && hasNotificationsScope);
      
      if (!hasNotificationsAccess || !hasValidScopeCombination) {
        return { 
          valid: false, 
          user, 
          hasNotificationsAccess: false,
          scopes,
          error: 'Token lacks required scopes for notifications. Required: notifications, repo, or read:org + notifications'
        };
      }

      return { 
        valid: true, 
        user, 
        hasNotificationsAccess: true,
        scopes
      };
    } catch (error) {
      return { 
        valid: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get the authenticated user's information
   */
  async getAuthenticatedUser(): Promise<GitHubUser> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const response = await fetch(`${this.baseUrl}/user`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(): Promise<GitHubRepository[]> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const response = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get repositories: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(): Promise<GitHubOrganization[]> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const response = await fetch(`${this.baseUrl}/user/orgs`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get organizations: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(params: {
    all?: boolean;
    participating?: boolean;
    since?: string;
    before?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<any[]> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/notifications?${searchParams.toString()}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get notifications: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(threadId: string): Promise<void> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const response = await fetch(`${this.baseUrl}/notifications/threads/${threadId}`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(params: { last_read_at?: string } = {}): Promise<void> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const response = await fetch(`${this.baseUrl}/notifications`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.status} ${response.statusText}`);
    }
  }
}
