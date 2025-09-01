import * as keytar from 'keytar';

const SERVICE_NAME = 'OctoBar';
const ACCOUNT_NAME = 'GitHub_PAT';
const FILTER_SETTINGS_ACCOUNT = 'Filter_Settings';

// Platform-specific storage info for logging
const getStorageInfo = () => {
  switch (process.platform) {
    case 'darwin':
      return 'macOS Keychain';
    case 'win32':
      return 'Windows Credential Manager';
    case 'linux':
      return 'Linux Secret Service (libsecret)';
    default:
      return 'System credential store';
  }
};

export class SecureStorage {
  /**
   * Save the GitHub Personal Access Token securely
   */
  static async savePAT(pat: string): Promise<boolean> {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, pat);
      console.log(`PAT saved successfully to ${getStorageInfo()}`);
      return true;
    } catch (error) {
      console.error(`Failed to save PAT to ${getStorageInfo()}:`, error);
      return false;
    }
  }

  /**
   * Retrieve the GitHub Personal Access Token
   */
  static async getPAT(): Promise<string | null> {
    try {
      const pat = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      if (pat) {
        console.log(`PAT retrieved successfully from ${getStorageInfo()}`);
      } else {
        console.log(`No PAT found in ${getStorageInfo()}`);
      }
      return pat;
    } catch (error) {
      console.error(`Failed to retrieve PAT from ${getStorageInfo()}:`, error);
      return null;
    }
  }

  /**
   * Delete the GitHub Personal Access Token
   */
  static async deletePAT(): Promise<boolean> {
    try {
      const deleted = await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
      if (deleted) {
        console.log(`PAT deleted successfully from ${getStorageInfo()}`);
      } else {
        console.log(`No PAT found to delete in ${getStorageInfo()}`);
      }
      return deleted;
    } catch (error) {
      console.error(`Failed to delete PAT from ${getStorageInfo()}:`, error);
      return false;
    }
  }

  /**
   * Check if a PAT exists
   */
  static async hasPAT(): Promise<boolean> {
    try {
      const pat = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      return pat !== null;
    } catch (error) {
      console.error(`Failed to check PAT existence in ${getStorageInfo()}:`, error);
      return false;
    }
  }

  /**
   * Save filter settings (organizations and repositories)
   */
  static async saveFilterSettings(selectedOrgs: string[], selectedRepos: string[]): Promise<boolean> {
    try {
      const filterSettings = {
        organizations: selectedOrgs,
        repositories: selectedRepos,
        savedAt: new Date().toISOString()
      };
      await keytar.setPassword(SERVICE_NAME, FILTER_SETTINGS_ACCOUNT, JSON.stringify(filterSettings));
      console.log(`Filter settings saved successfully to ${getStorageInfo()}`);
      return true;
    } catch (error) {
      console.error(`Failed to save filter settings to ${getStorageInfo()}:`, error);
      return false;
    }
  }

  /**
   * Retrieve filter settings
   */
  static async getFilterSettings(): Promise<{ organizations: string[], repositories: string[] } | null> {
    try {
      const settings = await keytar.getPassword(SERVICE_NAME, FILTER_SETTINGS_ACCOUNT);
      if (settings) {
        const parsed = JSON.parse(settings);
        console.log(`Filter settings retrieved successfully from ${getStorageInfo()}`);
        return {
          organizations: parsed.organizations || [],
          repositories: parsed.repositories || []
        };
      } else {
        console.log(`No filter settings found in ${getStorageInfo()}`);
        return null;
      }
    } catch (error) {
      console.error(`Failed to retrieve filter settings from ${getStorageInfo()}:`, error);
      return null;
    }
  }

  /**
   * Check if filter settings exist
   */
  static async hasFilterSettings(): Promise<boolean> {
    try {
      const settings = await keytar.getPassword(SERVICE_NAME, FILTER_SETTINGS_ACCOUNT);
      return settings !== null;
    } catch (error) {
      console.error(`Failed to check filter settings existence in ${getStorageInfo()}:`, error);
      return false;
    }
  }

  /**
   * Delete filter settings
   */
  static async deleteFilterSettings(): Promise<boolean> {
    try {
      const deleted = await keytar.deletePassword(SERVICE_NAME, FILTER_SETTINGS_ACCOUNT);
      if (deleted) {
        console.log(`Filter settings deleted successfully from ${getStorageInfo()}`);
      } else {
        console.log(`No filter settings found to delete in ${getStorageInfo()}`);
      }
      return deleted;
    } catch (error) {
      console.error(`Failed to delete filter settings from ${getStorageInfo()}:`, error);
      return false;
    }
  }
}
