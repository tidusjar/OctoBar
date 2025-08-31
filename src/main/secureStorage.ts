import * as keytar from 'keytar';

const SERVICE_NAME = 'OctoBar';
const ACCOUNT_NAME = 'GitHub_PAT';

export class SecureStorage {
  /**
   * Save the GitHub Personal Access Token securely
   */
  static async savePAT(pat: string): Promise<boolean> {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, pat);
      console.log('PAT saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save PAT:', error);
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
        console.log('PAT retrieved successfully');
      } else {
        console.log('No PAT found');
      }
      return pat;
    } catch (error) {
      console.error('Failed to retrieve PAT:', error);
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
        console.log('PAT deleted successfully');
      } else {
        console.log('No PAT found to delete');
      }
      return deleted;
    } catch (error) {
      console.error('Failed to delete PAT:', error);
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
      console.error('Failed to check PAT existence:', error);
      return false;
    }
  }
}
