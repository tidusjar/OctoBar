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

// Simple logging utility with timestamps
const log = (message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
};

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
    // Custom filter parameters
    filterOrgs?: string[];
    filterRepos?: string[];
    filterSubjectTypes?: string[];
    filterReasons?: string[];
    // Pagination control
    maxPages?: number;
  } = {}): Promise<any[]> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const searchParams = new URLSearchParams();
    
    // Only add GitHub API supported parameters to the URL
    const supportedParams = ['all', 'participating', 'since', 'before', 'per_page', 'page'];
    supportedParams.forEach(key => {
      if (params[key as keyof typeof params] !== undefined) {
        searchParams.append(key, params[key as keyof typeof params]!.toString());
      }
    });

    const url = `${this.baseUrl}/notifications?${searchParams.toString()}`;
    log('🌐 Fetching notifications from:', url);
    log('🔑 Headers:', this.getHeaders());
    log('🔍 Custom filters will be applied client-side:', {
      filterOrgs: params.filterOrgs,
      filterRepos: params.filterRepos,
      filterSubjectTypes: params.filterSubjectTypes,
      filterReasons: params.filterReasons
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    log('📡 Response status:', response.status, response.statusText);
    log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`Failed to get notifications: ${response.status} ${response.statusText}`);
    }

    // Collect all notifications with pagination
    let allNotifications: any[] = [];
    let currentPage = params.page || 1;
    const maxPages = params.maxPages || 3; // Limit to 3 pages (300 notifications max)
    
    while (currentPage <= maxPages) {
      // Update search params for current page
      const pageParams = new URLSearchParams();
      supportedParams.forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          pageParams.append(key, params[key as keyof typeof params]!.toString());
        }
      });
      pageParams.set('page', currentPage.toString());
      
      const pageUrl = `${this.baseUrl}/notifications?${pageParams.toString()}`;
      log(`🌐 Fetching page ${currentPage} from:`, pageUrl);
      
      const pageResponse = await fetch(pageUrl, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!pageResponse.ok) {
        throw new Error(`Failed to get notifications page ${currentPage}: ${pageResponse.status} ${pageResponse.statusText}`);
      }
      
      // Check for rate limiting
      const pollInterval = pageResponse.headers.get('X-Poll-Interval');
      if (pollInterval) {
        log(`⏰ GitHub suggests polling every ${pollInterval} seconds`);
      }
      
      const pageData = await pageResponse.json();
      log(`📨 Page ${currentPage} data length:`, pageData.length);
      
      // If we get less than per_page, we've reached the end
      if (pageData.length < (params.per_page || 100)) {
        allNotifications = allNotifications.concat(pageData);
        break;
      }
      
      allNotifications = allNotifications.concat(pageData);
      currentPage++;
    }
    
    log(`📨 Total notifications fetched: ${allNotifications.length} across ${currentPage - 1} pages`);

    // Apply custom filtering if filter parameters are provided
    if (params.filterOrgs || params.filterRepos || params.filterSubjectTypes || params.filterReasons) {
      log(`🔍 Starting client-side filtering of ${allNotifications.length} notifications...`);
      log(`🔍 Filter parameters received:`, {
        filterOrgs: params.filterOrgs,
        filterRepos: params.filterRepos,
        filterSubjectTypes: params.filterSubjectTypes,
        filterReasons: params.filterReasons
      });
      const startTime = performance.now();
      
      const filteredData = this.filterNotifications(
        allNotifications, 
        params.filterOrgs || [], 
        params.filterRepos || [],
        params.filterSubjectTypes || [],
        params.filterReasons || []
      );
      
      const endTime = performance.now();
      log(`🔍 Filtered notifications: ${allNotifications.length} → ${filteredData.length} (${(endTime - startTime).toFixed(2)}ms)`);
      return filteredData;
    }

    return allNotifications;
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(threadId: string): Promise<void> {
    if (!this.token) {
      throw new Error('No token set');
    }

    const url = `${this.baseUrl}/notifications/threads/${threadId}`;
    log(`🔍 Making API call to: ${url}`);
    log(`🔍 Headers:`, this.getHeaders());

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders()
    });

    log(`🔍 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response');
      log(`❌ Error response body:`, errorText);
      throw new Error(`Failed to mark notification as read: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    log(`✅ Successfully marked notification ${threadId} as read via API`);
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

  /**
   * Mark filtered notifications as read (respects current filters)
   */
  async markFilteredNotificationsAsRead(filterParams: {
    filterOrgs?: string[];
    filterRepos?: string[];
    filterSubjectTypes?: string[];
    filterReasons?: string[];
  }): Promise<{ markedCount: number; totalFiltered: number }> {
    if (!this.token) {
      throw new Error('No token set');
    }

    log('🔍 Marking filtered notifications as read with filters:', filterParams);

    // First, get the filtered notifications
    const filteredNotifications = await this.getNotifications({
      ...filterParams,
      per_page: 100,
      maxPages: 10 // Allow more pages for marking as read
    });

    if (filteredNotifications.length === 0) {
      log('✅ No filtered notifications to mark as read');
      return { markedCount: 0, totalFiltered: 0 };
    }

    log(`🔍 Found ${filteredNotifications.length} filtered notifications to mark as read`);
    log('🔍 Notification IDs to mark as read:', filteredNotifications.map(n => n.id));
    log('🔍 First notification structure:', filteredNotifications[0] ? {
      id: filteredNotifications[0].id,
      thread_id: filteredNotifications[0].thread_id,
      subject: filteredNotifications[0].subject,
      repository: filteredNotifications[0].repository?.full_name
    } : 'No notifications');

    // Mark each notification as read individually
    let markedCount = 0;
    const errors: string[] = [];

    for (const notification of filteredNotifications) {
      try {
        // Use thread_id if available, otherwise fall back to id
        const threadId = notification.thread_id || notification.id;
        log(`🔍 Marking notification ${threadId} as read...`);
        log(`🔍 Notification details:`, {
          id: notification.id,
          thread_id: notification.thread_id,
          using_thread_id: threadId,
          type: typeof threadId,
          subject: notification.subject?.title,
          repository: notification.repository?.full_name
        });
        
        await this.markNotificationAsRead(threadId);
        markedCount++;
        log(`✅ Successfully marked notification ${threadId} as read`);
        
        // Add a small delay to avoid rate limiting
        if (markedCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        const errorMsg = `Failed to mark notification ${notification.id} as read: ${error instanceof Error ? error.message : 'Unknown error'}`;
        log(`❌ ${errorMsg}`);
        log(`🔍 Full error details:`, error);
        errors.push(errorMsg);
      }
    }

    if (errors.length > 0) {
      log(`⚠️ ${errors.length} notifications failed to be marked as read:`, errors);
    }

    log(`✅ Successfully marked ${markedCount} out of ${filteredNotifications.length} filtered notifications as read`);
    
    return { 
      markedCount, 
      totalFiltered: filteredNotifications.length 
    };
  }

  /**
   * Filter notifications based on organization, repository, subject type, and reason selections
   */
  private filterNotifications(
    notifications: any[], 
    filterOrgs: string[], 
    filterRepos: string[], 
    filterSubjectTypes: string[] = [], 
    filterReasons: string[] = []
  ): any[] {
    // If no filters are applied, return all notifications
    if (filterOrgs.length === 0 && filterRepos.length === 0 && filterSubjectTypes.length === 0 && filterReasons.length === 0) {
      log('🔍 No filters applied, returning all notifications');
      return notifications;
    }

    log('🔍 Filtering notifications with:', { 
      filterOrgs, 
      filterRepos, 
      filterSubjectTypes,
      filterReasons,
      totalNotifications: notifications.length 
    });
    
    log('🔍 Filter details:', {
      filterOrgsLength: filterOrgs.length,
      filterReposLength: filterRepos.length,
      filterOrgs: filterOrgs,
      filterRepos: filterRepos
    });

    const filtered = notifications.filter(notification => {
      const repo = notification.repository;
      if (!repo) {
        log('🔍 Notification has no repository, excluding:', notification.id);
        return false;
      }

      const repoId = repo.id.toString();
      const ownerId = repo.owner?.id?.toString();
      const ownerLogin = repo.owner?.login;
      const repoName = repo.full_name;
      const subjectType = notification.subject?.type;
      const reason = notification.reason;
      
      // Debug: Log the raw repository data
      if (notifications.indexOf(notification) < 2) {
        log('🔍 Raw repository data:', {
          repoId: repo.id,
          repoIdType: typeof repo.id,
          repoIdString: repoId,
          ownerId: repo.owner?.id,
          ownerIdType: typeof repo.owner?.id,
          ownerIdString: ownerId
        });
      }
      
      // Debug: Log the first few notifications to see the data structure
      if (notifications.indexOf(notification) < 3) {
        log('🔍 Sample notification data:', {
          notificationId: notification.id,
          repoId: repoId,
          repoIdType: typeof repoId,
          ownerId: ownerId,
          ownerIdType: typeof ownerId,
          ownerLogin: ownerLogin,
          repoName: repoName,
          subjectType: subjectType,
          reason: reason
        });
      }

      log(`🔍 Checking notification ${notification.id} from repo ${repoName}:`, {
        repoId,
        ownerId,
        ownerLogin,
        subjectType,
        reason,
        isRepoSelected: filterRepos.includes(repoId),
        isOwnerSelected: ownerId && filterOrgs.includes(ownerId),
        isOwnerLoginSelected: ownerLogin && filterOrgs.includes(ownerLogin),
        isSubjectTypeSelected: filterSubjectTypes.length === 0 || filterSubjectTypes.includes(subjectType),
        isReasonSelected: filterReasons.length === 0 || filterReasons.includes(reason)
      });

      // Check repository/organization filters
      let matchesRepoFilter = false;
      if (filterOrgs.length === 0 && filterRepos.length === 0) {
        matchesRepoFilter = true; // No repo/org filters applied
      } else {
        // Check if the repository is directly selected
        const isRepoSelected = filterRepos.includes(repoId) || 
                              filterRepos.includes(repo.id.toString()) ||
                              filterRepos.some(id => String(id).trim() === String(repoId).trim());
        
        // Check if the repository's owner (organization or user) is selected
        const isOwnerSelected = (ownerId && filterOrgs.includes(ownerId)) || 
                               (ownerLogin && filterOrgs.includes(ownerLogin));
        
        log(`🔍 Checking repo ${repoName} (ID: ${repoId}):`, {
          isRepoSelected,
          isOwnerSelected,
          filterRepos,
          filterOrgs,
          repoId,
          ownerId,
          ownerLogin
        });
        
        // If we have repository filters, only show explicitly selected repositories
        if (filterRepos.length > 0) {
          if (isRepoSelected) {
            log(`✅ Repository ${repoName} (ID: ${repoId}) is directly selected`);
            matchesRepoFilter = true;
          } else {
            log(`❌ Repository ${repoName} (ID: ${repoId}) is not in selected repositories`);
          }
        }
        // If we only have organization filters (no repository filters), show all repos from those orgs
        else if (filterOrgs.length > 0) {
          if (isOwnerSelected) {
            log(`✅ Repository ${repoName} owner (${ownerLogin || ownerId}) is selected`);
            matchesRepoFilter = true;
          } else {
            log(`❌ Repository ${repoName} owner (${ownerLogin || ownerId}) is not selected`);
          }
        }
      }

      // Check subject type filter
      const matchesSubjectTypeFilter = filterSubjectTypes.length === 0 || filterSubjectTypes.includes(subjectType);

      // Check reason filter
      const matchesReasonFilter = filterReasons.length === 0 || filterReasons.includes(reason);

      const matches = matchesRepoFilter && matchesSubjectTypeFilter && matchesReasonFilter;
      
      if (!matches) {
        log(`❌ Notification ${notification.id} does not match filters`);
      }

      return matches;
    });

    log(`🔍 Filtering complete: ${notifications.length} → ${filtered.length} notifications`);
    
    // Debug: Log some statistics
    if (filterRepos.length > 0) {
      const repoMatches = filtered.filter(n => {
        const repoId = n.repository?.id?.toString();
        return repoId && filterRepos.includes(repoId);
      });
      log(`🔍 Repository filter results: ${repoMatches.length} notifications from selected repositories`);
    }
    
    return filtered;
  }
}
