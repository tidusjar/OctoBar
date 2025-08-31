import { useState } from 'react';
import { motion } from 'framer-motion';

interface PATStepProps {
  pat: string;
  onPatChange: (pat: string) => void;
}

export function PATStep({ pat, onPatChange }: PATStepProps) {
  const [showPAT, setShowPAT] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handlePATChange = (value: string) => {
    console.log('PAT changed:', value.length, 'characters');
    onPatChange(value);
    const valid = value.trim().length >= 40;
    setIsValid(valid);
    console.log('PAT validation:', valid);
  };

  const openGitHubDocs = () => {
    window.open('https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token', '_blank');
  };

  return (
    <div className="pat-step">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pat-content"
      >
        <div className="step-header">
          <h2>GitHub Personal Access Token</h2>
          <p>
            We need your GitHub Personal Access Token to fetch your notifications securely.
          </p>
        </div>

        <div className="pat-input-section">
          <label htmlFor="pat-input" className="input-label">
            Personal Access Token
          </label>
          
          <div className="pat-input-wrapper">
            <input
              id="pat-input"
              type={showPAT ? 'text' : 'password'}
              value={pat}
              onChange={(e) => handlePATChange(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={`pat-input ${isValid ? 'valid' : ''}`}
            />
            
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPAT(!showPAT)}
              aria-label={showPAT ? 'Hide token' : 'Show token'}
            >
              {showPAT ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="pat-validation">
            {pat.length > 0 && (
              <div className={`validation-message ${isValid ? 'valid' : 'invalid'}`}>
                {isValid ? '✓ Valid token format' : '✗ Token must be at least 40 characters'}
              </div>
            )}
          </div>
        </div>

        <div className="pat-help">
          <p>
            <strong>Don't have a token?</strong>
          </p>
          <button
            type="button"
            className="btn btn-link"
            onClick={openGitHubDocs}
          >
            Learn how to create one →
          </button>
        </div>

        <div className="security-note">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <strong>Your token is stored securely</strong>
            <p>We use your system's keychain to encrypt and store your token locally.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
