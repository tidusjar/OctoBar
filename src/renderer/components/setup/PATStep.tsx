import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitHubService } from '../../services/githubService';

interface PATStepProps {
  pat: string;
  onPatChange: (pat: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  isChecking: boolean;
  error?: string;
  user?: {
    login: string;
    name: string;
    avatar_url: string;
  };
  hasNotificationsAccess?: boolean;
  scopes?: string[];
}

export function PATStep({ pat, onPatChange }: PATStepProps) {
  const [showPAT, setShowPAT] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    isChecking: false
  });

  const githubService = new GitHubService();

  // Debounced validation effect
  useEffect(() => {
    if (pat.length < 40) {
      setValidation({ isValid: false, isChecking: false });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setValidation(prev => ({ ...prev, isChecking: true }));
      
      try {
        const result = await githubService.validateToken(pat);
        
        if (result.valid && result.user) {
          setValidation({
            isValid: true,
            isChecking: false,
            user: {
              login: result.user.login,
              name: result.user.name || result.user.login,
              avatar_url: result.user.avatar_url
            },
            hasNotificationsAccess: result.hasNotificationsAccess,
            scopes: result.scopes
          });
        } else {
          setValidation({
            isValid: false,
            isChecking: false,
            error: result.error
          });
        }
      } catch (error) {
        setValidation({
          isValid: false,
          isChecking: false,
          error: 'Failed to validate token'
        });
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [pat]);

  const handlePATChange = (value: string) => {
    onPatChange(value);
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
              className={`pat-input ${validation.isValid ? 'valid' : ''}`}
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
              <div className="validation-message">
                {validation.isChecking ? (
                  <span className="checking">🔄 Validating token...</span>
                ) : validation.isValid ? (
                  <div className="valid-token">
                    <span className="valid">✓ Valid token</span>
                    {validation.user && (
                      <div className="user-info">
                        <img 
                          src={validation.user.avatar_url} 
                          alt={validation.user.name}
                          className="user-avatar"
                        />
                        <span className="user-name">{validation.user.name}</span>
                        <span className="user-login">@{validation.user.login}</span>
                      </div>
                    )}
                    {validation.hasNotificationsAccess && (
                      <div className="permissions-info">
                        <span className="permission-ok">✓ Notifications access confirmed</span>
                        {validation.scopes && validation.scopes.length > 0 && (
                          <div className="scopes-info">
                            <span className="scopes-label">Token scopes:</span>
                            <div className="scopes-list">
                              {validation.scopes.map((scope, index) => (
                                <span key={index} className="scope-tag">{scope}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!validation.hasNotificationsAccess && (
                      <div className="permissions-warning">
                        <span className="permission-warning">⚠️ Limited access</span>
                        <p className="permission-details">
                          {validation.error || 'Token may not have full notifications access'}
                        </p>
                        <div className="scopes-info">
                          <span className="scopes-label">Current scopes:</span>
                          <div className="scopes-list">
                            {validation.scopes && validation.scopes.length > 0 ? (
                              validation.scopes.map((scope, index) => (
                                <span key={index} className="scope-tag">{scope}</span>
                              ))
                            ) : (
                              <span className="scope-tag no-scopes">No scopes detected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="invalid-token">
                    <span className="invalid">✗ {validation.error || 'Invalid token'}</span>
                  </div>
                )}
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
          <div className="scope-requirements">
            <p>
              <strong>Required scopes for notifications:</strong>
            </p>
            <ul>
              <li><code>notifications</code> - Read notifications (minimum required)</li>
              <li><code>repo</code> - Access repositories (includes notifications)</li>
              <li><code>read:org</code> + <code>notifications</code> - Read org data + notifications</li>
            </ul>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: '0' }}>
              <strong>Note:</strong> Your token must have at least one of these scope combinations to access notifications.
            </p>
          </div>
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
