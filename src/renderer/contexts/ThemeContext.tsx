import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (window.electronAPI?.getSettings) {
          const settings = await window.electronAPI.getSettings();
          if (settings?.theme) {
            setThemeState(settings.theme);
          }
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    };

    loadTheme();
  }, []);

  // Resolve theme based on system preference
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        resolveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to storage
    try {
      if (window.electronAPI?.setSettings) {
        const currentSettings = await window.electronAPI.getSettings?.() || {};
        await window.electronAPI.setSettings({
          ...currentSettings,
          theme: newTheme
        });
      }
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
