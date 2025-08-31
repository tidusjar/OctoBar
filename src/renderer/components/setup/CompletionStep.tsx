import { motion } from 'framer-motion';

export function CompletionStep() {
  return (
    <div className="completion-step">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="completion-content"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="completion-icon"
        >
          🎉
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="completion-title"
        >
          All Set!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="completion-description"
        >
          Your OctoBar is now configured and ready to go. You'll start receiving GitHub notifications in your menu bar.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="completion-features"
        >
          <div className="feature">
            <div className="feature-icon">🔔</div>
            <div className="feature-text">
              <strong>Real-time notifications</strong>
              <span>Get notified instantly when something happens</span>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">⚙️</div>
            <div className="feature-text">
              <strong>Customizable filters</strong>
              <span>Focus on what matters most to you</span>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">
              <strong>Secure storage</strong>
              <span>Your token is safely stored in your keychain</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="completion-tip"
        >
          <p>
            <strong>Tip:</strong> Click the OctoBar icon in your menu bar to view notifications and access settings.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
