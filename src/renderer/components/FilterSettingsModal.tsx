import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterStep } from './setup/FilterStep';
import { NotificationSubjectType, NotificationReason } from '../types/notifications';

interface FilterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    selectedOrgs: string[], 
    selectedRepos: string[], 
    selectedSubjectTypes: NotificationSubjectType[],
    selectedReasons: NotificationReason[]
  ) => Promise<void>;
  initialSelectedOrgs?: string[];
  initialSelectedRepos?: string[];
  initialSelectedSubjectTypes?: NotificationSubjectType[];
  initialSelectedReasons?: NotificationReason[];
}

export function FilterSettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSelectedOrgs = [], 
  initialSelectedRepos = [],
  initialSelectedSubjectTypes = [],
  initialSelectedReasons = []
}: FilterSettingsModalProps) {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(initialSelectedOrgs);
  const [selectedRepos, setSelectedRepos] = useState<string[]>(initialSelectedRepos);
  const [selectedSubjectTypes, setSelectedSubjectTypes] = useState<NotificationSubjectType[]>(initialSelectedSubjectTypes);
  const [selectedReasons, setSelectedReasons] = useState<NotificationReason[]>(initialSelectedReasons);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'repositories' | 'types' | 'reasons'>('repositories');

  // Reset to initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOrgs(initialSelectedOrgs);
      setSelectedRepos(initialSelectedRepos);
      setSelectedSubjectTypes(initialSelectedSubjectTypes);
      setSelectedReasons(initialSelectedReasons);
    }
  }, [isOpen, initialSelectedOrgs, initialSelectedRepos, initialSelectedSubjectTypes, initialSelectedReasons]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(selectedOrgs, selectedRepos, selectedSubjectTypes, selectedReasons);
      onClose();
    } catch (error) {
      console.error('Error saving filter settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial values
    setSelectedOrgs(initialSelectedOrgs);
    setSelectedRepos(initialSelectedRepos);
    setSelectedSubjectTypes(initialSelectedSubjectTypes);
    setSelectedReasons(initialSelectedReasons);
    onClose();
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  // Helper functions for subject types and reasons
  const subjectTypes: { value: NotificationSubjectType; label: string; icon: string }[] = [
    { value: 'Issue', label: 'Issues', icon: '🐛' },
    { value: 'PullRequest', label: 'Pull Requests', icon: '🔀' },
    { value: 'Commit', label: 'Commits', icon: '📝' },
    { value: 'Release', label: 'Releases', icon: '🏷️' },
    { value: 'Discussion', label: 'Discussions', icon: '💬' }
  ];

  const reasons: { value: NotificationReason; label: string; icon: string; description: string }[] = [
    { value: 'assign', label: 'Assigned', icon: '👤', description: 'You were assigned to an issue or PR' },
    { value: 'author', label: 'Author', icon: '✍️', description: 'You authored the issue or PR' },
    { value: 'comment', label: 'Comments', icon: '💬', description: 'New comments on issues or PRs' },
    { value: 'invitation', label: 'Invitations', icon: '📧', description: 'Repository or organization invitations' },
    { value: 'manual', label: 'Manual', icon: '🔔', description: 'Manually subscribed notifications' },
    { value: 'mention', label: 'Mentions', icon: '👋', description: 'You were mentioned in a comment' },
    { value: 'push', label: 'Pushes', icon: '⬆️', description: 'New commits pushed to repositories' },
    { value: 'review_requested', label: 'Review Requests', icon: '👀', description: 'You were requested to review a PR' },
    { value: 'security_alert', label: 'Security Alerts', icon: '🔒', description: 'Security vulnerabilities detected' },
    { value: 'state_change', label: 'State Changes', icon: '🔄', description: 'Issues or PRs were closed/merged' },
    { value: 'subscribed', label: 'Subscribed', icon: '👁️', description: 'You are watching the repository' },
    { value: 'team_mention', label: 'Team Mentions', icon: '👥', description: 'Your team was mentioned' }
  ];

  const handleSubjectTypeToggle = (type: NotificationSubjectType) => {
    const newSelection = selectedSubjectTypes.includes(type)
      ? selectedSubjectTypes.filter(t => t !== type)
      : [...selectedSubjectTypes, type];
    setSelectedSubjectTypes(newSelection);
  };

  const handleReasonToggle = (reason: NotificationReason) => {
    const newSelection = selectedReasons.includes(reason)
      ? selectedReasons.filter(r => r !== reason)
      : [...selectedReasons, reason];
    setSelectedReasons(newSelection);
  };

  const handleSelectAllSubjectTypes = () => {
    setSelectedSubjectTypes(subjectTypes.map(s => s.value));
  };

  const handleClearAllSubjectTypes = () => {
    setSelectedSubjectTypes([]);
  };

  const handleSelectAllReasons = () => {
    setSelectedReasons(reasons.map(r => r.value));
  };

  const handleClearAllReasons = () => {
    setSelectedReasons([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCancel}
      >
        <motion.div
          className="modal-content filter-settings-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Filter Settings</h2>
            <button 
              className="modal-close-button"
              onClick={handleCancel}
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <div className="filter-settings-description">
              <p>Configure which organizations, repositories, notification types, and reasons you want to receive notifications for.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeTab === 'repositories' ? 'active' : ''}`}
                onClick={() => setActiveTab('repositories')}
              >
                <span className="tab-icon">📁</span>
                <span className="tab-label">Repositories</span>
              </button>
              <button 
                className={`filter-tab ${activeTab === 'types' ? 'active' : ''}`}
                onClick={() => setActiveTab('types')}
              >
                <span className="tab-icon">🏷️</span>
                <span className="tab-label">Types</span>
              </button>
              <button 
                className={`filter-tab ${activeTab === 'reasons' ? 'active' : ''}`}
                onClick={() => setActiveTab('reasons')}
              >
                <span className="tab-icon">🔔</span>
                <span className="tab-label">Reasons</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="filter-tab-content">
              {activeTab === 'repositories' && (
                <FilterStep
                  selectedOrgs={selectedOrgs}
                  selectedRepos={selectedRepos}
                  onOrgsChange={setSelectedOrgs}
                  onReposChange={setSelectedRepos}
                />
              )}

              {activeTab === 'types' && (
                <div className="filter-section">
                  <div className="filter-section-header">
                    <h3>Notification Types</h3>
                    <div className="filter-actions">
                      <button 
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleSelectAllSubjectTypes}
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleClearAllSubjectTypes}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="filter-list">
                    {subjectTypes.map((subjectType) => (
                      <label key={subjectType.value} className="filter-item">
                        <input
                          type="checkbox"
                          checked={selectedSubjectTypes.includes(subjectType.value)}
                          onChange={() => handleSubjectTypeToggle(subjectType.value)}
                        />
                        <span className="filter-icon">{subjectType.icon}</span>
                        <span className="filter-label">{subjectType.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reasons' && (
                <div className="filter-section">
                  <div className="filter-section-header">
                    <h3>Notification Reasons</h3>
                    <div className="filter-actions">
                      <button 
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleSelectAllReasons}
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleClearAllReasons}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="filter-list">
                    {reasons.map((reason) => (
                      <label key={reason.value} className="filter-item filter-item-detailed">
                        <input
                          type="checkbox"
                          checked={selectedReasons.includes(reason.value)}
                          onChange={() => handleReasonToggle(reason.value)}
                        />
                        <div className="filter-item-content">
                          <div className="filter-item-header">
                            <span className="filter-icon">{reason.icon}</span>
                            <span className="filter-label">{reason.label}</span>
                          </div>
                          <div className="filter-description">{reason.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
