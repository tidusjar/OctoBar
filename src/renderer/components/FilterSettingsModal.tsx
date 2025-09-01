import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterStep } from './setup/FilterStep';

interface FilterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedOrgs: string[], selectedRepos: string[]) => Promise<void>;
  initialSelectedOrgs?: string[];
  initialSelectedRepos?: string[];
}

export function FilterSettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSelectedOrgs = [], 
  initialSelectedRepos = [] 
}: FilterSettingsModalProps) {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(initialSelectedOrgs);
  const [selectedRepos, setSelectedRepos] = useState<string[]>(initialSelectedRepos);
  const [isSaving, setIsSaving] = useState(false);

  // Reset to initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOrgs(initialSelectedOrgs);
      setSelectedRepos(initialSelectedRepos);
    }
  }, [isOpen, initialSelectedOrgs, initialSelectedRepos]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(selectedOrgs, selectedRepos);
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
              <p>Configure which organizations and repositories you want to receive notifications from.</p>
            </div>
            
            <FilterStep
              selectedOrgs={selectedOrgs}
              selectedRepos={selectedRepos}
              onOrgsChange={setSelectedOrgs}
              onReposChange={setSelectedRepos}
            />
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
