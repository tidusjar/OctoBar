import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeStep } from './setup/WelcomeStep';
import { PATStep } from './setup/PATStep';
import { FilterStep } from './setup/FilterStep';
import { CompletionStep } from './setup/CompletionStep';
import { GitHubService } from '../services/githubService';
import './SetupWizard.css';

export type WizardStep = 'welcome' | 'pat' | 'filter' | 'completion';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [pat, setPat] = useState('');
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [patValidation, setPatValidation] = useState<{ 
    isValid: boolean; 
    isChecking: boolean;
    hasNotificationsAccess?: boolean;
  }>({
    isValid: false,
    isChecking: false
  });

  const githubService = new GitHubService();

  const steps: { key: WizardStep; title: string }[] = [
    { key: 'welcome', title: 'Welcome' },
    { key: 'pat', title: 'GitHub Token' },
    { key: 'filter', title: 'Filters' },
    { key: 'completion', title: 'Complete' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const handleNext = async () => {
    console.log('Next button clicked, current step:', currentStep);
    console.log('Current PAT length:', pat.length);
    console.log('PAT validation:', patValidation);
    console.log('Can proceed:', canProceed());
    
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('pat');
        break;
      case 'pat':
        // Save PAT before proceeding
        console.log('Saving PAT...');
        console.log('window.electronAPI available:', !!window.electronAPI);
        console.log('window.electronAPI.savePAT available:', !!(window.electronAPI && window.electronAPI.savePAT));
        
        setIsSaving(true);
        try {
          if (!window.electronAPI || !window.electronAPI.savePAT) {
            throw new Error('Electron API not available');
          }
          
          const success = await window.electronAPI.savePAT(pat);
          console.log('PAT save result:', success);
          if (success) {
            setCurrentStep('filter');
          } else {
            console.error('Failed to save PAT');
            // You could show an error message here
          }
        } catch (error) {
          console.error('Error saving PAT:', error);
          // You could show an error message here
        } finally {
          setIsSaving(false);
        }
        break;
      case 'filter':
        // Save filter settings before proceeding to completion
        console.log('Saving filter settings...');
        try {
          if (window.electronAPI && (window.electronAPI as any).saveFilterSettings) {
            const success = await (window.electronAPI as any).saveFilterSettings(selectedOrgs, selectedRepos);
            console.log('Filter settings save result:', success);
          }
        } catch (error) {
          console.error('Error saving filter settings:', error);
        }
        setCurrentStep('completion');
        break;
      case 'completion':
        onComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'pat':
        setCurrentStep('welcome');
        break;
      case 'filter':
        setCurrentStep('pat');
        break;
      case 'completion':
        setCurrentStep('filter');
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'pat':
        // Check if PAT is valid and has notifications access
        const canGo = patValidation.isValid && 
                     patValidation.hasNotificationsAccess && 
                     !patValidation.isChecking && 
                     !isSaving;
        console.log('PAT validation check:', { 
          pat: pat.trim().length, 
          patValid: patValidation.isValid, 
          hasNotificationsAccess: patValidation.hasNotificationsAccess,
          isChecking: patValidation.isChecking,
          isSaving, 
          canGo 
        });
        return canGo;
      case 'filter':
        // Filter step is optional - users can proceed with no selections
        return true;
      case 'completion':
        return true;
      default:
        return false;
    }
  };

  const handlePatChange = (newPat: string) => {
    setPat(newPat);
    
    // Update validation state based on PAT length
    if (newPat.length < 40) {
      setPatValidation({ isValid: false, isChecking: false });
    } else {
      setPatValidation({ isValid: false, isChecking: true });
      
      // Validate the token
      githubService.validateToken(newPat).then(result => {
        setPatValidation({ 
          isValid: result.valid, 
          isChecking: false,
          hasNotificationsAccess: result.hasNotificationsAccess
        });
      }).catch(() => {
        setPatValidation({ isValid: false, isChecking: false });
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'pat':
        return (
          <PATStep
            pat={pat}
            onPatChange={handlePatChange}
          />
        );
      case 'filter':
        return (
          <FilterStep
            selectedOrgs={selectedOrgs}
            selectedRepos={selectedRepos}
            onOrgsChange={setSelectedOrgs}
            onReposChange={setSelectedRepos}
          />
        );
      case 'completion':
        return <CompletionStep />;
      default:
        return null;
    }
  };

  return (
    <div className="setup-wizard">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`progress-step ${index <= currentStepIndex ? 'active' : ''} ${
                index === currentStepIndex ? 'current' : ''
              }`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
        <div className="progress-line">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="step-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="wizard-navigation">
        {currentStep !== 'welcome' && (
          <button
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={isSaving}
          >
            Back
          </button>
        )}
        
        <div className="nav-spacer" />
        
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {isSaving ? 'Saving...' : currentStep === 'completion' ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
