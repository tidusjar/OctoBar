import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface FilterSettings {
  organizations: string[];
  repositories: string[];
  subjectTypes: string[];
  reasons: string[];
}

export interface AppSettings {
  refreshInterval: number;
  enableSound: boolean;
  enableDesktopNotifications: boolean;
  autoStart: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface Settings {
  filters: FilterSettings;
  app: AppSettings;
  version: string;
  lastUpdated: string;
}

export class SettingsStorage {
  private static settingsPath: string;
  private static defaultSettings: Settings;

  static {
    // Initialize settings path
    this.settingsPath = path.join(app.getPath('userData'), 'octobar-settings.json');
    
    // Set default settings
    this.defaultSettings = {
      filters: {
        organizations: [],
        repositories: [],
        subjectTypes: [],
        reasons: []
      },
      app: {
        refreshInterval: 5,
        enableSound: true,
        enableDesktopNotifications: true,
        autoStart: false,
        theme: 'system'
      },
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get the settings file path
   */
  static getSettingsPath(): string {
    return this.settingsPath;
  }

  /**
   * Load settings from file
   */
  static async loadSettings(): Promise<Settings> {
    try {
      console.log(`📁 Loading settings from: ${this.settingsPath}`);
      console.log(`📁 Settings file exists: ${fs.existsSync(this.settingsPath)}`);
      
      if (!fs.existsSync(this.settingsPath)) {
        console.log('📁 Settings file does not exist, creating with defaults');
        await this.saveSettings(this.defaultSettings);
        return { ...this.defaultSettings };
      }

      const data = fs.readFileSync(this.settingsPath, 'utf8');
      console.log('📁 Raw settings file content:', data);
      const settings = JSON.parse(data) as Settings;
      
      // Merge with defaults to handle missing properties
      const mergedSettings = this.mergeWithDefaults(settings);
      
      console.log('✅ Settings loaded successfully');
      return mergedSettings;
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      console.log('📁 Falling back to default settings');
      return { ...this.defaultSettings };
    }
  }

  /**
   * Save settings to file
   */
  static async saveSettings(settings: Partial<Settings>): Promise<boolean> {
    try {
      console.log(`💾 Saving settings to: ${this.settingsPath}`);
      
      // Load current settings and merge with new ones
      const currentSettings = await this.loadSettings();
      const mergedSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date().toISOString()
      };

      // Ensure directory exists
      const dir = path.dirname(this.settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to file
      fs.writeFileSync(this.settingsPath, JSON.stringify(mergedSettings, null, 2));
      
      console.log('✅ Settings saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Save filter settings
   */
  static async saveFilterSettings(filterSettings: FilterSettings): Promise<boolean> {
    try {
      console.log('🔍 Saving filter settings:', filterSettings);
      console.log('🔍 Filter settings details:', {
        organizations: filterSettings.organizations,
        repositories: filterSettings.repositories,
        subjectTypes: filterSettings.subjectTypes,
        reasons: filterSettings.reasons
      });
      const result = await this.saveSettings({ filters: filterSettings });
      console.log('🔍 Save result:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save filter settings:', error);
      return false;
    }
  }

  /**
   * Load filter settings
   */
  static async loadFilterSettings(): Promise<FilterSettings> {
    try {
      const settings = await this.loadSettings();
      console.log('📋 Loaded settings from storage:', settings);
      console.log('🔍 Filter settings being returned:', settings.filters);
      return settings.filters;
    } catch (error) {
      console.error('❌ Failed to load filter settings:', error);
      console.log('🔄 Returning default filter settings:', this.defaultSettings.filters);
      return this.defaultSettings.filters;
    }
  }

  /**
   * Save app settings
   */
  static async saveAppSettings(appSettings: AppSettings): Promise<boolean> {
    try {
      console.log('⚙️ Saving app settings:', appSettings);
      return await this.saveSettings({ app: appSettings });
    } catch (error) {
      console.error('❌ Failed to save app settings:', error);
      return false;
    }
  }

  /**
   * Load app settings
   */
  static async loadAppSettings(): Promise<AppSettings> {
    try {
      const settings = await this.loadSettings();
      return settings.app;
    } catch (error) {
      console.error('❌ Failed to load app settings:', error);
      return this.defaultSettings.app;
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(): Promise<boolean> {
    try {
      console.log('🔄 Resetting settings to defaults');
      return await this.saveSettings(this.defaultSettings);
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      return false;
    }
  }

  /**
   * Check if settings file exists
   */
  static hasSettings(): boolean {
    return fs.existsSync(this.settingsPath);
  }

  /**
   * Delete settings file
   */
  static async deleteSettings(): Promise<boolean> {
    try {
      if (fs.existsSync(this.settingsPath)) {
        fs.unlinkSync(this.settingsPath);
        console.log('🗑️ Settings file deleted');
      }
      return true;
    } catch (error) {
      console.error('❌ Failed to delete settings file:', error);
      return false;
    }
  }

  /**
   * Merge loaded settings with defaults to handle missing properties
   */
  private static mergeWithDefaults(settings: any): Settings {
    return {
      filters: {
        ...this.defaultSettings.filters,
        ...(settings.filters || {})
      },
      app: {
        ...this.defaultSettings.app,
        ...(settings.app || {})
      },
      version: settings.version || this.defaultSettings.version,
      lastUpdated: settings.lastUpdated || new Date().toISOString()
    };
  }
}
