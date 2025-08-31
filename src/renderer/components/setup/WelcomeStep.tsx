import { motion } from 'framer-motion';

export function WelcomeStep() {
  return (
    <div className="welcome-step">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="welcome-content"
      >
        <div className="welcome-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="welcome-title">Welcome to OctoBar</h1>
        
        <p className="welcome-description">
          Your GitHub notifications, right in your menu bar. Let's get you set up in just a few steps.
        </p>
        
        <div className="welcome-features">
          <div className="feature">
            <div className="feature-icon">🔔</div>
            <span>Real-time notifications</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <span>Secure token storage</span>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <span>Lightning fast</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
