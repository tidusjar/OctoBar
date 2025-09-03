import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitHubService } from '../../services/githubService';

interface FilterStepProps {
  selectedOrgs: string[];
  selectedRepos: string[];
  onOrgsChange: (orgs: string[]) => void;
  onReposChange: (repos: string[]) => void;
}

export function FilterStep({ selectedOrgs, selectedRepos, onOrgsChange, onReposChange }: FilterStepProps) {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [repoSearchTerm, setRepoSearchTerm] = useState('');

  useEffect(() => {
    loadGitHubData();
  }, []);

  const loadGitHubData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if electronAPI is available
      if (!window.electronAPI || !window.electronAPI.getPAT) {
        setError('Electron API not available. Please restart the app and try again.');
        setLoading(false);
        return;
      }

      // Get the stored PAT from the main process
      let pat: string | null = null;
      try {
        pat = await window.electronAPI.getPAT();
      } catch (error) {
        console.error('Failed to get PAT from main process:', error);
        setError('Failed to retrieve stored token. Please go back and re-enter your token.');
        setLoading(false);
        return;
      }

      if (!pat) {
        setError('No GitHub token found. Please go back and enter a valid token.');
        setLoading(false);
        return;
      }

      const githubService = new GitHubService(pat);

      // Load organizations and repositories in parallel
      const [orgsData, reposData] = await Promise.all([
        githubService.getUserOrganizations(),
        githubService.getUserRepositories()
      ]);

      setOrgs(orgsData);
      setRepos(reposData);
    } catch (error) {
      console.error('Failed to load GitHub data:', error);
      setError('Failed to load GitHub data. Please check your token and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrgToggle = (orgId: string) => {
    const newSelection = selectedOrgs.includes(orgId)
      ? selectedOrgs.filter(id => id !== orgId)
      : [...selectedOrgs, orgId];
    onOrgsChange(newSelection);
  };

  const handleRepoToggle = (repoId: string) => {
    const newSelection = selectedRepos.includes(repoId)
      ? selectedRepos.filter(id => id !== repoId)
      : [...selectedRepos, repoId];
    onReposChange(newSelection);
  };

  const handleSelectAllOrgs = () => {
    onOrgsChange(orgs.map(org => org.id.toString()));
  };

  const handleClearAllOrgs = () => {
    onOrgsChange([]);
  };

  const handleSelectAllRepos = () => {
    onReposChange(repos.map(repo => repo.id.toString()));
  };

  const handleClearAllRepos = () => {
    onReposChange([]);
  };

  // Filter organizations and repositories based on search terms
  const filteredOrgs = orgs.filter(org => 
    org.name?.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
    org.login?.toLowerCase().includes(orgSearchTerm.toLowerCase())
  );

  const filteredRepos = repos.filter(repo => 
    repo.name?.toLowerCase().includes(repoSearchTerm.toLowerCase()) ||
    repo.full_name?.toLowerCase().includes(repoSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="filter-step">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your GitHub organizations and repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-step">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={loadGitHubData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="filter-step">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="filter-content"
      >
        <div className="step-header">
          <h2>Notification Filters (Optional)</h2>
          <p>
            Choose which organizations and repositories you want to receive notifications from.
            <strong> Leave everything unselected to receive notifications from all sources.</strong>
          </p>
        </div>

        {/* Organizations Section */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Organizations ({orgs.length})</h3>
            <div className="section-actions">
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={handleSelectAllOrgs}
              >
                Select All
              </button>
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={handleClearAllOrgs}
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Organization Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search organizations..."
              value={orgSearchTerm}
              onChange={(e) => setOrgSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {orgs.length === 0 ? (
            <div className="empty-state">
              <p>No organizations found. You can still receive notifications from your personal repositories.</p>
            </div>
          ) : (
            <div className="filter-list">
              {filteredOrgs.map((org) => (
                <motion.div
                  key={org.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`filter-item ${selectedOrgs.includes(org.id.toString()) ? 'selected' : ''}`}
                  onClick={() => handleOrgToggle(org.id.toString())}
                >
                  <div className="item-avatar">
                    {org.avatar_url ? (
                      <img src={org.avatar_url} alt={org.login} />
                    ) : null}
                  </div>
                  <div className="item-name">{org.name || org.login}</div>
                  <div className="item-checkbox">
                    {selectedOrgs.includes(org.id.toString()) ? '✓' : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Repositories Section */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Repositories ({repos.length})</h3>
            <div className="section-actions">
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={handleSelectAllRepos}
              >
                Select All
              </button>
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={handleClearAllRepos}
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Repository Search */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search repositories..."
              value={repoSearchTerm}
              onChange={(e) => setRepoSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {repos.length === 0 ? (
            <div className="empty-state">
              <p>No repositories found.</p>
            </div>
          ) : (
            <div className="filter-list">
              {filteredRepos.map((repo) => (
                <motion.div
                  key={repo.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`filter-item ${selectedRepos.includes(repo.id.toString()) ? 'selected' : ''}`}
                  onClick={() => handleRepoToggle(repo.id.toString())}
                >
                  <div className="item-avatar">
                    {repo.owner?.avatar_url ? (
                      <img src={repo.owner.avatar_url} alt={repo.name} />
                    ) : null}
                  </div>
                  <div className="item-details">
                    <div className="item-name">{repo.name}</div>
                    <div className="item-org">{repo.full_name.split('/')[0]}</div>
                  </div>
                  <div className="item-checkbox">
                    {selectedRepos.includes(repo.id.toString()) ? '✓' : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="filter-note">
          <div className="note-icon">💡</div>
          <div className="note-content">
            <strong>How filtering works:</strong>
            <ul>
              <li><strong>Nothing selected:</strong> Receive notifications from all sources</li>
              <li><strong>Orgs selected:</strong> Only notifications from those organizations</li>
              <li><strong>Repos selected:</strong> Only notifications from those repositories</li>
              <li><strong>Both selected:</strong> Combined filtering (orgs + repos)</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
