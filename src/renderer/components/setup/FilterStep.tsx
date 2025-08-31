import { motion } from 'framer-motion';

interface FilterStepProps {
  selectedOrgs: string[];
  selectedRepos: string[];
  onOrgsChange: (orgs: string[]) => void;
  onReposChange: (repos: string[]) => void;
}

// Mock data for organizations and repositories
const mockOrgs = [
  { id: 'org1', name: 'Acme Corp', avatar: '🏢' },
  { id: 'org2', name: 'TechStart', avatar: '🚀' },
  { id: 'org3', name: 'OpenSource', avatar: '📦' },
  { id: 'org4', name: 'DevTeam', avatar: '👥' },
];

const mockRepos = [
  { id: 'repo1', name: 'frontend-app', org: 'Acme Corp', avatar: '⚛️' },
  { id: 'repo2', name: 'backend-api', org: 'Acme Corp', avatar: '🔧' },
  { id: 'repo3', name: 'mobile-app', org: 'TechStart', avatar: '📱' },
  { id: 'repo4', name: 'docs', org: 'OpenSource', avatar: '📚' },
  { id: 'repo5', name: 'cli-tool', org: 'DevTeam', avatar: '🛠️' },
];

export function FilterStep({ selectedOrgs, selectedRepos, onOrgsChange, onReposChange }: FilterStepProps) {
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
    onOrgsChange(mockOrgs.map(org => org.id));
  };

  const handleClearAllOrgs = () => {
    onOrgsChange([]);
  };

  const handleSelectAllRepos = () => {
    onReposChange(mockRepos.map(repo => repo.id));
  };

  const handleClearAllRepos = () => {
    onReposChange([]);
  };

  return (
    <div className="filter-step">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="filter-content"
      >
        <div className="step-header">
          <h2>Notification Filters</h2>
          <p>
            Choose which organizations and repositories you want to receive notifications from.
            You can always change these later in settings.
          </p>
        </div>

        {/* Organizations Section */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Organizations</h3>
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
          
          <div className="filter-grid">
            {mockOrgs.map((org) => (
              <motion.div
                key={org.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`filter-item ${selectedOrgs.includes(org.id) ? 'selected' : ''}`}
                onClick={() => handleOrgToggle(org.id)}
              >
                <div className="item-avatar">{org.avatar}</div>
                <div className="item-name">{org.name}</div>
                <div className="item-checkbox">
                  {selectedOrgs.includes(org.id) ? '✓' : ''}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Repositories Section */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Repositories</h3>
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
          
          <div className="filter-grid">
            {mockRepos.map((repo) => (
              <motion.div
                key={repo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`filter-item ${selectedRepos.includes(repo.id) ? 'selected' : ''}`}
                onClick={() => handleRepoToggle(repo.id)}
              >
                <div className="item-avatar">{repo.avatar}</div>
                <div className="item-details">
                  <div className="item-name">{repo.name}</div>
                  <div className="item-org">{repo.org}</div>
                </div>
                <div className="item-checkbox">
                  {selectedRepos.includes(repo.id) ? '✓' : ''}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="filter-note">
          <p>
            <strong>Note:</strong> You can always modify these filters later in the app settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
